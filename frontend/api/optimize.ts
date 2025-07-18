// frontend/api/optimize.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const { budget, variety, scores, restaurantId } = req.body;
    // restaurantId will be implemented later

    if (budget > 2500) {
        res.status(400).json({ error: 'Budget is too high' });
    }

    const result = await client.query('SELECT * FROM menu_items');
    const menuItems = result.rows;
    let userScores:{[key: number]: number} = scores;

    /*
    - User enters budget and scores
    - User chooses variety preference (could be 3 options, 5, 10 maybe)(could be buttons or a slider)
    - We create as many possible instances of each item (if the budget is $20 and a burrito is $5, we make 4 burrito instances), each with a decreasing score depending on the variety preference 
    - Use 0/1 knapsack to generate most optimal order
    */

    // Add user scores to the menu items
    type ScoredItem = {
        id: number;
        name: string;
        price: number;
        score: number;
        instance: number;
    };

    const scoredItems:ScoredItem[] = [];
    // Variety function: https://www.desmos.com/calculator/62wnlreoka
    const scale = 0.1; // somewhere between 0.05 and 1. Just not under 0
    for (const item of menuItems) {
        const userScore = userScores[item.id];
        if(userScore === undefined)
        continue;
        let numInstaces = Math.floor(budget / item.price);
        for (let instance = 1; instance <= numInstaces; instance++){
        const itemCopy = {...item, instance} // keep track of the instance for the backtracking step

        // value = userScore * e ^ (-scale * varietyScore * (instance - 1))
        itemCopy.score = userScore * Math.pow(Math.E, -scale * variety * (instance - 1));
        if(itemCopy.score < 0){
            itemCopy.score = 0;
        }
        scoredItems.push(itemCopy);
        }
    }

    // 0/1 Knapsack algorithm: Table creation
    const numberOfItems = scoredItems.length;
    const maxPrice = Math.round(budget * 100);
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
    
    const optimalOrder:ScoredItem[] = [];
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

    res.send(optimalOrder.reverse());

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    await client.end();
  }
}