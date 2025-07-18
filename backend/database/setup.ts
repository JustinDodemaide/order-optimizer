import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function migrateToPostgres() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      calories INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL
    );
  `);

  // clear existing entires
  await client.query('TRUNCATE TABLE menu_items RESTART IDENTITY');

  // Load from file and insert entries
  const dataPath = path.join(__dirname, 'taco-bell.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const menuData = JSON.parse(fileContents);

  for (const item of menuData) {
    await client.query(
      'INSERT INTO menu_items (name, price, calories, restaurant_id) VALUES ($1, $2, $3, $4)',
      [item.name, item.price, item.calories, item.restaurant_id]
    );
  }

  await client.end();
}

migrateToPostgres().catch(err => {
  console.error(err);
  process.exit(1);
});