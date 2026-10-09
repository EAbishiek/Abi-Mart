import { getDb, saveDatabase } from '../db';
import { UserRole } from '../../src/types';

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export class UserRepository {
  /**
   * Find user entity by email address using parameterized SQL statement.
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const db = await getDb();
    const stmt = db.prepare('SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?');
    stmt.bind([email.toLowerCase().trim()]);

    let user: UserEntity | null = null;
    if (stmt.step()) {
      user = stmt.getAsObject() as unknown as UserEntity;
    }
    stmt.free();
    return user;
  }

  /**
   * Find user entity by ID using parameterized SQL statement.
   */
  async findById(id: number): Promise<UserEntity | null> {
    const db = await getDb();
    const stmt = db.prepare('SELECT id, name, email, password_hash, role, created_at FROM users WHERE id = ?');
    stmt.bind([id]);

    let user: UserEntity | null = null;
    if (stmt.step()) {
      user = stmt.getAsObject() as unknown as UserEntity;
    }
    stmt.free();
    return user;
  }

  /**
   * Insert a new user into database with parameterized query.
   */
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<UserEntity> {
    const db = await getDb();
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );
    const normalizedEmail = data.email.toLowerCase().trim();
    stmt.run([data.name.trim(), normalizedEmail, data.passwordHash, data.role]);
    stmt.free();

    saveDatabase();

    // Fetch created user
    const createdUser = await this.findByEmail(normalizedEmail);
    if (!createdUser) {
      throw new Error('Failed to retrieve user after creation');
    }
    return createdUser;
  }

  /**
   * Get all users for admin view / database inspector.
   */
  async findAll(): Promise<UserEntity[]> {
    const db = await getDb();
    const stmt = db.prepare('SELECT id, name, email, password_hash, role, created_at FROM users ORDER BY id ASC');
    const users: UserEntity[] = [];

    while (stmt.step()) {
      users.push(stmt.getAsObject() as unknown as UserEntity);
    }
    stmt.free();
    return users;
  }

  /**
   * Get total count of registered users.
   */
  async count(): Promise<number> {
    const db = await getDb();
    const res = db.exec('SELECT COUNT(*) as cnt FROM users');
    return (res[0]?.values[0]?.[0] as number) || 0;
  }
}

export const userRepository = new UserRepository();
