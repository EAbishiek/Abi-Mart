import { getDb, saveDatabase } from '../db';
import { CartItem, Product } from '../../src/types';
import { productRepository } from './productRepository';

export class CartRepository {
  /**
   * Get all cart items for a given user with attached product details
   */
  async findByUserId(userId: number): Promise<CartItem[]> {
    const db = await getDb();
    const stmt = db.prepare(`
      SELECT c.id, c.user_id, c.product_id, c.quantity
      FROM cart_items c
      WHERE c.user_id = ?
      ORDER BY c.id ASC
    `);
    stmt.bind([userId]);

    const items: CartItem[] = [];
    while (stmt.step()) {
      const item = stmt.getAsObject() as unknown as CartItem;
      items.push(item);
    }
    stmt.free();

    // Attach product details
    for (const item of items) {
      const prod = await productRepository.findById(item.product_id);
      if (prod) {
        item.product = prod;
      }
    }

    return items;
  }

  /**
   * Add item to cart or increment quantity if already in cart
   */
  async addItem(userId: number, productId: number, quantity: number = 1): Promise<CartItem[]> {
    const db = await getDb();
    
    // Check if item already exists in user cart
    const checkStmt = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
    checkStmt.bind([userId, productId]);

    let existingId: number | null = null;
    let existingQty = 0;
    if (checkStmt.step()) {
      const row = checkStmt.getAsObject() as any;
      existingId = row.id;
      existingQty = row.quantity;
    }
    checkStmt.free();

    if (existingId !== null) {
      const updateStmt = db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
      updateStmt.run([existingQty + quantity, existingId]);
      updateStmt.free();
    } else {
      const insertStmt = db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
      insertStmt.run([userId, productId, quantity]);
      insertStmt.free();
    }

    saveDatabase();
    return this.findByUserId(userId);
  }

  /**
   * Update quantity of item in cart
   */
  async updateQuantity(userId: number, productId: number, quantity: number): Promise<CartItem[]> {
    const db = await getDb();
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const stmt = db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?');
    stmt.run([quantity, userId, productId]);
    stmt.free();

    saveDatabase();
    return this.findByUserId(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: number, productId: number): Promise<CartItem[]> {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?');
    stmt.run([userId, productId]);
    stmt.free();

    saveDatabase();
    return this.findByUserId(userId);
  }

  /**
   * Clear all items in user's cart
   */
  async clear(userId: number): Promise<boolean> {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ?');
    stmt.run([userId]);
    stmt.free();

    saveDatabase();
    return true;
  }

  /**
   * Sync guest items into logged in user's cart
   */
  async syncGuestCart(userId: number, guestItems: { productId: number; quantity: number }[]): Promise<CartItem[]> {
    for (const item of guestItems) {
      if (item.productId && item.quantity > 0) {
        await this.addItem(userId, item.productId, item.quantity);
      }
    }
    return this.findByUserId(userId);
  }
}

export const cartRepository = new CartRepository();
