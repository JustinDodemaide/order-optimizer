import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 3000;

async function getDb() {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

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

app.get('/menu', async (req: Request, res: Response) => {
  const db = await getDb();
  const menuItems = await db.all('SELECT * FROM menu_items');
  res.json(menuItems);
});

app.get('/optimize/:userId/:budget/:variety', async (req: Request, res: Response) => {
  // 1.0, 0.85, 0.7, 0.55, 0.4
  const variety: number = parseFloat(req.params.variety);
  const userId = parseInt(req.params.userId, 10);
  const budgetNum = parseFloat(req.params.budget);

  //if (budgetNum > 2500) {
    //return res.status(400).json({ error: 'Budget is too high' });
  //}

  const db = await getDb();
  const menuItems = await db.all('SELECT * FROM menu_items')
  const userRatings = await db.all(
    'SELECT * FROM user_ratings WHERE user_id = ?',
    [userId]
  );

  let userScores:{[key: number]: number} = {};
  userRatings.forEach(rating => {
    userScores[rating.item_id] = rating.rating;
  });

  /*
  - User enters budget and scores 
  - User chooses variety preference (could be 3 options, 5, 10 maybe)(could be buttons or a slider)
  - We create as many possible instances of each item (if the budget is $20 and a burrito is $5, we make 4 burrito instances), each with a decreasing score depending on the variety preference 
  - Use 0/1 knapsack to generate most optimal order
  */

  // Add user scores to the menu items
  const scoredItems: {
    id: number;
    name: string;
    price: number;
    score: number;
    instance: number;
  }[] = [];
  for (const item of menuItems) {
    const userScore = userScores[item.id];
    if(userScore === undefined)
      continue;
    let numInstaces = Math.floor(budgetNum / item.price);
    for (let instance = 1; instance <= numInstaces; instance++){
      const itemCopy = {...item, instance} // keep track of the instance for the backtracking step
      itemCopy.score = userScore * Math.pow(variety, instance - 1);
      scoredItems.push(itemCopy);
    }
  }

  // 0/1 Knapsack algorithm: Table creation
  const numberOfItems = scoredItems.length;
  const maxPrice = Math.round(budgetNum * 100);
  // Initialize table with 0s
  const table = Array(numberOfItems + 1).fill(0).map(() => Array(maxPrice + 1).fill(0));

  // Iterate through each item
  for(let itemIndex = 1; itemIndex <= numberOfItems; itemIndex++){
    const currentItem = scoredItems[itemIndex - 1];
    const itemPrice = Math.round(currentItem.price * 100);
    const itemScore = currentItem.score;
    
    // Iterate through each possible budget amount
    for(let currentBudget = 1; currentBudget <= maxPrice; currentBudget++){
      if(itemPrice > currentBudget){
        // If adding this item exceeds the budget, don't add it
        table[itemIndex][currentBudget] = table[itemIndex - 1][currentBudget];
      }
      else{
        // If we can afford the item:
        // Don't include the item: The score is the one from the row above (table[itemIndex - 1][currentBudget])
        // Or, include the item: The score is the item's score plus the best score we could get with the remaining budget (currentBudget - itemPrice).
        // We take the maximum of these two choices
        table[itemIndex][currentBudget] = Math.max(
          table[itemIndex - 1][currentBudget],
          itemScore + table[itemIndex - 1][currentBudget - itemPrice]
        );
      }
    }
  }

  // Best score is in the bottom right of the table
  const maxScore = table[numberOfItems][maxPrice];
  
  const optimalOrder = [];
  let currentScore = maxScore;
  let currentBudget = maxPrice;

  // Start from the max (bottom right) and work backwards
  for(let row = numberOfItems; row > 0 && currentScore > 0; row--){
    // If the score in the cell above is the same as the current cell, it means the current item was not included
    if(currentScore === table[row - 1][currentBudget])
      continue;
    else{
      const chosenItem = scoredItems[row - 1];
      optimalOrder.push(chosenItem);

      // Subtract the item's score and cost find the state of the table before this item was added
      currentScore -= chosenItem.score;
      currentBudget -= Math.round(chosenItem.price * 100);
    }
  }

  res.send(optimalOrder.reverse())
});