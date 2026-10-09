import { getDb, saveDatabase } from '../db';
import { Order, OrderItem, OrderStatus, ShippingAddress } from '../../src/types';
import { productRepository } from './productRepository';
import { cartRepository } from './cartRepository';

export class OrderRepository {
  /**
   * Create new order with order items, decrease product stock, and clear cart
   */
  async createOrder(params: {
    buyerId: number;
    items: { productId: number; quantity: number; unitPriceCents: number }[];
    totalAmountCents: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
  }): Promise<Order> {
    const db = await getDb();
    const trackingNumber = `ABM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const addressJson = JSON.stringify(params.shippingAddress);

    // 1. Insert into orders table
    const orderStmt = db.prepare(`
      INSERT INTO orders (buyer_id, status, total_amount_cents, shipping_address_json, payment_method, tracking_number)
      VALUES (?, 'CONFIRMED', ?, ?, ?, ?)
    `);
    orderStmt.run([
      params.buyerId,
      params.totalAmountCents,
      addressJson,
      params.paymentMethod,
      trackingNumber,
    ]);
    orderStmt.free();

    // 2. Get created order ID
    const idRes = db.exec('SELECT last_insert_rowid() as id');
    const orderId = (idRes[0]?.values[0]?.[0] as number) || 1;

    // 3. Insert order items & adjust product inventory
    for (const item of params.items) {
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
        VALUES (?, ?, ?, ?)
      `);
      itemStmt.run([orderId, item.productId, item.quantity, item.unitPriceCents]);
      itemStmt.free();

      // Deduct stock from products
      await productRepository.updateStock(item.productId, -item.quantity);
    }

    // 4. Clear buyer's cart
    await cartRepository.clear(params.buyerId);

    saveDatabase();

    const createdOrder = await this.findById(orderId);
    if (!createdOrder) {
      throw new Error('Failed to retrieve order after creation.');
    }
    return createdOrder;
  }

  /**
   * Find order by ID with populated items
   */
  async findById(orderId: number): Promise<Order | null> {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    stmt.bind([orderId]);

    let order: Order | null = null;
    if (stmt.step()) {
      order = stmt.getAsObject() as unknown as Order;
    }
    stmt.free();

    if (!order) return null;

    // Parse shipping address
    try {
      order.shippingAddress = JSON.parse(order.shipping_address_json || '{}');
    } catch {
      order.shippingAddress = undefined;
    }

    // Fetch order items
    order.items = await this.getOrderItems(order.id);
    return order;
  }

  /**
   * Find all orders placed by a specific buyer
   */
  async findByBuyerId(buyerId: number): Promise<Order[]> {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY id DESC');
    stmt.bind([buyerId]);

    const orders: Order[] = [];
    while (stmt.step()) {
      orders.push(stmt.getAsObject() as unknown as Order);
    }
    stmt.free();

    for (const ord of orders) {
      try {
        ord.shippingAddress = JSON.parse(ord.shipping_address_json || '{}');
      } catch {
        ord.shippingAddress = undefined;
      }
      ord.items = await this.getOrderItems(ord.id);
    }

    return orders;
  }

  /**
   * Find all orders across system (for Admin & Sellers)
   */
  async findAll(): Promise<Order[]> {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM orders ORDER BY id DESC');
    const orders: Order[] = [];
    while (stmt.step()) {
      orders.push(stmt.getAsObject() as unknown as Order);
    }
    stmt.free();

    for (const ord of orders) {
      try {
        ord.shippingAddress = JSON.parse(ord.shipping_address_json || '{}');
      } catch {
        ord.shippingAddress = undefined;
      }
      ord.items = await this.getOrderItems(ord.id);
    }

    return orders;
  }

  /**
   * Update order fulfillment status
   */
  async updateStatus(orderId: number, status: OrderStatus): Promise<Order | null> {
    const db = await getDb();
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    stmt.run([status, orderId]);
    stmt.free();

    saveDatabase();
    return this.findById(orderId);
  }

  /**
   * Private helper to fetch items for an order
   */
  private async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    stmt.bind([orderId]);

    const items: OrderItem[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject() as unknown as OrderItem);
    }
    stmt.free();

    for (const item of items) {
      const prod = await productRepository.findById(item.product_id);
      if (prod) {
        item.product = prod;
      }
    }

    return items;
  }
}

export const orderRepository = new OrderRepository();
