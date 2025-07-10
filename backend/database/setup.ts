import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function setupDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY,
      restaurant_id INTEGER,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      calories INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_ratings (
      user_id INTEGER,
      item_id INTEGER,
      rating INTEGER,
      PRIMARY KEY (user_id, item_id)
    );
  `);

  console.log('complete');
}

setupDatabase();