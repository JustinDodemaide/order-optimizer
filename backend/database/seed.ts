import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function seedDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // test users
  await db.run(`INSERT OR REPLACE INTO users (username) VALUES ('testuser')`);
  await db.run(`INSERT OR REPLACE INTO users (username) VALUES ('justin')`);

  // test menu
  const menuItems = [
    { id: 1, restaurant_id: 1, name: 'Burger', price: 12.99, calories: 600 },
    { id: 2, restaurant_id: 1, name: 'Sushi', price: 15.99, calories: 400 },
    { id: 3, restaurant_id: 1, name: 'Crunchwrap', price: 6.19, calories: 530 },
    { id: 4, restaurant_id: 1, name: 'Fries', price: 3.99, calories: 320 },
    { id: 5, restaurant_id: 1, name: 'A slice of bread between 2 more slices of bread', price: 8.99, calories: 250 }
  ];

  for (const item of menuItems) {
    await db.run(
      `INSERT OR REPLACE INTO menu_items (id, restaurant_id, name, price, calories) 
       VALUES (?, ?, ?, ?, ?)`,
      [item.id, item.restaurant_id, item.name, item.price, item.calories]
    );
  }

  // test ratings for testuser
  const ratings = [
    { user_id: 1, item_id: 1, rating: 5 },
    { user_id: 1, item_id: 2, rating: 4 },
    { user_id: 1, item_id: 3, rating: 3 },
    { user_id: 1, item_id: 4, rating: 2 },
    { user_id: 1, item_id: 5, rating: 1 }
  ];

  for (const rating of ratings) {
    await db.run(
      `INSERT OR REPLACE INTO user_ratings (user_id, item_id, rating) 
       VALUES (?, ?, ?)`,
      [rating.user_id, rating.item_id, rating.rating]
    );
  }

  console.log('Database seeded successfully!');
  
  // check if everything got added
  const itemCount = await db.get('SELECT COUNT(*) as count FROM menu_items');
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  const ratingCount = await db.get('SELECT COUNT(*) as count FROM user_ratings');
  
  console.log(`${itemCount.count} items, ${userCount.count} users, ${ratingCount.count} ratings`);
}

seedDatabase();