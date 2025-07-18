import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM menu_items');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
}