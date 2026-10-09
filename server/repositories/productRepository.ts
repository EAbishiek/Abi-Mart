import { getDb, saveDatabase } from '../db';
import { Product } from '../../src/types';

export class ProductRepository {
  /**
   * Find products with parameterized query filters
   */
  async findAll(filters?: {
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: string;
  }): Promise<Product[]> {
    const db = await getDb();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.category && filters.category !== 'All') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.brand && filters.brand !== 'All') {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters?.search && filters.search.trim()) {
      query += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const term = `%${filters.search.trim()}%`;
      params.push(term, term, term);
    }

    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      query += ' AND price_cents >= ?';
      params.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      query += ' AND price_cents <= ?';
      params.push(filters.maxPrice);
    }

    if (filters?.inStockOnly) {
      query += ' AND stock_qty > 0';
    }

    // Sort order
    if (filters?.sortBy === 'price_asc') {
      query += ' ORDER BY price_cents ASC';
    } else if (filters?.sortBy === 'price_desc') {
      query += ' ORDER BY price_cents DESC';
    } else if (filters?.sortBy === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    const stmt = db.prepare(query);
    if (params.length > 0) {
      stmt.bind(params);
    }

    const products: Product[] = [];
    while (stmt.step()) {
      products.push(stmt.getAsObject() as unknown as Product);
    }
    stmt.free();

    return products;
  }

  /**
   * Find product by primary ID
   */
  async findById(id: number): Promise<Product | null> {
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    stmt.bind([id]);

    let prod: Product | null = null;
    if (stmt.step()) {
      prod = stmt.getAsObject() as unknown as Product;
    }
    stmt.free();
    return prod;
  }

  /**
   * Create a new product (Seller or Admin)
   */
  async create(data: {
    seller_id: number;
    name: string;
    brand: string;
    category: string;
    price_cents: number;
    stock_qty: number;
    badge?: string;
    image_url: string;
    description: string;
    specs_json?: string;
  }): Promise<Product> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO products (
        seller_id, name, brand, category, price_cents, stock_qty, badge, rating, reviews_count, image_url, description, specs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      data.seller_id,
      data.name.trim(),
      data.brand?.trim() || 'AbiMart Pro',
      data.category.trim(),
      data.price_cents,
      data.stock_qty,
      data.badge || '',
      5.0,
      1,
      data.image_url.trim(),
      data.description.trim(),
      data.specs_json || '{}',
    ]);
    stmt.free();

    saveDatabase();

    // Get latest inserted ID
    const idRes = db.exec('SELECT last_insert_rowid() as id');
    const newId = (idRes[0]?.values[0]?.[0] as number) || 1;
    const created = await this.findById(newId);
    if (!created) {
      throw new Error('Failed to retrieve newly created product.');
    }
    return created;
  }

  /**
   * Update existing product details
   */
  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    const db = await getDb();
    const existing = await this.findById(id);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?,
        brand = ?,
        category = ?,
        price_cents = ?,
        stock_qty = ?,
        badge = ?,
        image_url = ?,
        description = ?,
        specs_json = ?
      WHERE id = ?
    `);

    stmt.run([
      data.name !== undefined ? data.name : existing.name,
      data.brand !== undefined ? data.brand : existing.brand,
      data.category !== undefined ? data.category : existing.category,
      data.price_cents !== undefined ? data.price_cents : existing.price_cents,
      data.stock_qty !== undefined ? data.stock_qty : existing.stock_qty,
      data.badge !== undefined ? data.badge : existing.badge,
      data.image_url !== undefined ? data.image_url : existing.image_url,
      data.description !== undefined ? data.description : existing.description,
      data.specs_json !== undefined ? data.specs_json : existing.specs_json,
      id,
    ]);
    stmt.free();

    saveDatabase();
    return this.findById(id);
  }

  /**
   * Delete product by ID
   */
  async delete(id: number): Promise<boolean> {
    const db = await getDb();
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    saveDatabase();
    return true;
  }

  /**
   * Update stock inventory
   */
  async updateStock(id: number, delta: number): Promise<boolean> {
    const db = await getDb();
    const stmt = db.prepare('UPDATE products SET stock_qty = MAX(0, stock_qty + ?) WHERE id = ?');
    stmt.run([delta, id]);
    stmt.free();
    saveDatabase();
    return true;
  }

  /**
   * Get distinct categories
   */
  async getCategories(): Promise<string[]> {
    const db = await getDb();
    const res = db.exec('SELECT DISTINCT category FROM products ORDER BY category ASC');
    if (!res[0]?.values) return [];
    return res[0].values.map(v => v[0] as string);
  }

  /**
   * Get distinct brands
   */
  async getBrands(): Promise<string[]> {
    const db = await getDb();
    const res = db.exec('SELECT DISTINCT brand FROM products ORDER BY brand ASC');
    if (!res[0]?.values) return [];
    return res[0].values.map(v => v[0] as string);
  }
}

export const productRepository = new ProductRepository();
