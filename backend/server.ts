import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

const sampleMenu = [
  {id: 1, name: "Burger", price: 12.99, calories: 600},
  {id: 2, name: "Sushi", price: 15.99, calories: 400},
  {id: 3, name: "Crunchwrap", price: 6.19, calories: 530},
]

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Restaurant Optimizer API' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/menu', (req: Request, res: Response) => {
  res.json(sampleMenu);
});

app.get('/optimize/:budget', (req: Request, res: Response) => {
  const budget = parseFloat(req.params.budget);
  const affordableItems = sampleMenu[0];
  res.json(affordableItems);
});