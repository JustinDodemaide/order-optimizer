import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

async function seedDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      calories INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL
    );
  `);

  // clear existing data
  await db.exec('DELETE FROM menu_items');
  await db.exec("DELETE FROM sqlite_sequence WHERE name IN ('menu_items')");

  // get data from json
  const dataPath = path.join(__dirname, 'taco-bell.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const menuData = JSON.parse(fileContents);

  // insert into database  
  const insertMenuItem = await db.prepare(
    'INSERT INTO menu_items (name, price, calories, restaurant_id) VALUES (?, ?, ?, ?)'
  );

  for (const item of menuData) {
    await insertMenuItem.run(item.name, item.price, item.calories, item.restaurant_id);
  }
  await insertMenuItem.finalize();
    
  await db.close();
}

seedDatabase().catch(err => {
    console.error("Error seeding database:", err);
});