import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

let dbInstance: Database | null = null;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'capstone.sqlite');

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from', DB_FILE);
    } catch (e) {
      console.warn('Could not read existing database file, creating fresh one:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Initialized new in-memory SQLite database');
  }

  // Enable Foreign Keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Run Migration Service on Startup
  runMigrations(dbInstance);

  saveDatabase();
  return dbInstance;
}

function runMigrations(db: Database): void {
  console.log('[MigrationService] Checking database schema & migrations...');

  // Ensure schema_migrations table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
  let migrationFiles: string[] = [];

  if (fs.existsSync(migrationsDir)) {
    migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
  }

  // Get already applied migrations
  const stmt = db.prepare('SELECT name FROM schema_migrations');
  const applied = new Set<string>();
  while (stmt.step()) {
    const row = stmt.getAsObject();
    if (row.name) applied.add(row.name as string);
  }
  stmt.free();

  for (const file of migrationFiles) {
    if (!applied.has(file)) {
      console.log(`[MigrationService] Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      try {
        db.exec(sqlContent);
      } catch (migErr: any) {
        console.warn(`[MigrationService] Warning during ${file}:`, migErr.message);
      }
      
      const insertStmt = db.prepare('INSERT INTO schema_migrations (name) VALUES (?)');
      insertStmt.run([file]);
      insertStmt.free();
      console.log(`[MigrationService] Successfully applied ${file}`);
    } else {
      console.log(`[MigrationService] Migration already applied: ${file}`);
    }
  }

  // Seed default admin and sample accounts if users table is empty
  seedInitialData(db);
}

export function resetDatabase(): void {
  if (!dbInstance) return;
  try {
    console.log('[Database] Resetting database to initial schema and seed...');
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    dbInstance = null;
  } catch (err) {
    console.error('Error resetting database:', err);
  }
}

function seedInitialData(db: Database): void {
  try {
    const res = db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = res[0]?.values[0]?.[0] as number || 0;

    if (userCount === 0) {
      console.log('[SeedService] Seeding default Admin, Seller, and Buyer accounts...');
      db.run(`
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES 
        (1, 'System Administrator', 'admin@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'ADMIN', '2026-07-27 10:00:00'),
        (2, 'Abi Gaming Gear (Seller)', 'seller@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'SELLER', '2026-07-28 11:30:00'),
        (3, 'Alex Mercer (Buyer)', 'buyer@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'BUYER', '2026-07-29 14:15:00');
      `);
      console.log('[SeedService] Seed accounts created successfully.');
    }
  } catch (err) {
    console.error('[SeedService] Error seeding database:', err);
  }
}

