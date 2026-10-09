import { getDb, saveDatabase } from '../db';
import { Review } from '../../src/types';

export class ReviewRepository {
  /**
   * Find reviews for a product
   */
  async findByProductId(productId: number): Promise<Review[]> {
    const db = await getDb();
    const stmt = db.prepare(`
      SELECT id, product_id, user_id, user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ?
      ORDER BY id DESC
    `);
    stmt.bind([productId]);

    const reviews: Review[] = [];
    while (stmt.step()) {
      reviews.push(stmt.getAsObject() as unknown as Review);
    }
    stmt.free();
    return reviews;
  }

  /**
   * Add a review and update product average rating
   */
  async create(data: {
    productId: number;
    userId: number;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([
      data.productId,
      data.userId,
      data.userName || 'Verified Gamer',
      Math.min(5, Math.max(1, Math.round(data.rating))),
      data.comment.trim(),
    ]);
    stmt.free();

    // Recalculate product average rating & count
    const statsRes = db.exec(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as cnt
      FROM reviews
      WHERE product_id = ${data.productId}
    `);
    const avgRating = Math.round(((statsRes[0]?.values[0]?.[0] as number) || 5) * 10) / 10;
    const count = (statsRes[0]?.values[0]?.[1] as number) || 1;

    const updateProdStmt = db.prepare(`
      UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?
    `);
    updateProdStmt.run([avgRating, count, data.productId]);
    updateProdStmt.free();

    saveDatabase();

    // Return created review
    const list = await this.findByProductId(data.productId);
    return list[0];
  }
}

export const reviewRepository = new ReviewRepository();
