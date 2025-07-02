import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// --- Definitions ---
interface MenuItem {
  id: number;
  name: string;
  price: number;
  calories: number;
  score: number;
}

interface User {
  scores: UserScores;
}

interface UserScores {
  [key: number]: number;
}

// --- Placeholder values ---
const defaultScore = -1;

const sampleMenu: MenuItem[] = [
  {id: 1, name: "Burger", price: 12.99, calories: 600, score: defaultScore},
  {id: 2, name: "Sushi", price: 15.99, calories: 400, score: defaultScore},
  {id: 3, name: "Crunchwrap", price: 6.19, calories: 530, score: defaultScore},
];

const users: { [key: number]: User } = {
  1:{
    scores:{
        1: 5,
        2: 3,
        3: 4
    }
  },
  2:{
    scores:{
      1: 1,
      2: 3,
      3: 4
    }
  }
};

// --- Endpoints ---
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Restaurant Optimizer API' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/menu', (req: Request, res: Response) => {
  res.json(sampleMenu);
});

app.get('/optimize/:userId/:budget', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const budgetNum = parseFloat(req.params.budget);

  //if (budgetNum > 2500) {
    //return res.status(400).json({ error: 'Budget is too high' });
  //}

  // This is the line that was unhappy with undefined types
  let userScores:{[key: number]: number} = {};
  if (users[userId]) {
    userScores = users[userId].scores;
  }

  // Add the user's ratings to the items
  let scoredItems = [];
  for (const item of sampleMenu) {
    const itemCopy = {...item}
    const userScore = userScores[item.id];
    if(userScore !== undefined){
      itemCopy.score = userScore;
    }
    scoredItems.push(itemCopy);
  }

  // TODO: Unbounded knapsack implementation

  /*
  array m[0..n, 0..W];
  for j from 0 to W do:
      m[0, j] := 0
  for i from 1 to n do:
      m[i, 0] := 0

  for i from 1 to n do:
      for j from 1 to W do:
          if w[i] > j then:
              m[i, j] := m[i-1, j]
          else:
              m[i, j] := max(m[i-1, j], m[i-1, j-w[i]] + v[i])
  */

  
  res.send("")
});
