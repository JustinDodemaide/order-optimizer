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

    console.log("AHHHHHHH");
    const { budget, variety, scores, restaurantId } = req.body;
    console.log(scores);
    const budgetInCents = Math.round(budget * 100);
    console.log(budgetInCents);

    if (budget > 25000) {
      console.log("budget too high");
      res.status(400).json({ error: 'Budget is too high' });
      return;
    }

    /*
    - User enters budget and scores
    - User chooses variety preference (could be 3 options, 5, 10 maybe)(could be buttons or a slider)
    - We create as many possible instances of each item (if the budget is $20 and a burrito is $5, we make 4 burrito instances), each with a decreasing score depending on the variety preference 
    - Use 0/1 knapsack to generate most optimal order
    */
    // Variety function: https://www.desmos.com/calculator/62wnlreoka
    const varietyScale = 0.1; // somewhere between 0.05 and 1. Just not under 0

    // Add user scores to the menu items
    type ScoredItem = {
        id: number;
        name: string;
        price: number; // stored as cents
        score: number;
        instance: number;
    };
    const scoredItems:ScoredItem[] = [];

    const result = await client.query('SELECT * FROM menu_items');
    const menuItems = result.rows;

    for (const item of menuItems) {
        const userScore = scores[item.id];
        if(userScore === undefined)
          continue;
        const itemPriceInCents = Math.round(item.price * 100);
        let numInstances = Math.floor(budgetInCents / itemPriceInCents);

        console.log(item.name)
        console.log(itemPriceInCents)
        console.log(numInstances)

        for (let instance = 1; instance <= numInstances; instance++){
          const itemCopy = {...item, instance} // keep track of the instance for the backtracking step

        // value = userScore * e ^ (-scale * varietyScore * (instance - 1))
        itemCopy.score = userScore * Math.pow(Math.E, -varietyScale * variety * (instance - 1));
        itemCopy.price = itemPriceInCents;
        if(itemCopy.score < 0){
            itemCopy.score = 0;
        }

        console.log(itemCopy)

        scoredItems.push(itemCopy);
        }
    }

    console.log(scoredItems);

    // 0/1 Knapsack algorithm: Table creation
    const numberOfItems = scoredItems.length;
    const maxPrice = budgetInCents;
    // Initialize table with 0s
    const table = Array(numberOfItems + 1).fill(0).map(() => Array(maxPrice + 1).fill(0));

    // Iterate through each item
    for(let itemIndex = 1; itemIndex <= numberOfItems; itemIndex++){
        const currentItem = scoredItems[itemIndex - 1];
        const itemPrice = currentItem.price; // scoredItems are stored as cents
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
    
    // backtrack
    const optimalOrder: ScoredItem[] = [];
    let remainingBudget = maxPrice;

    for (let i = numberOfItems; i > 0 && remainingBudget > 0; i--) {
      const scoreWithItem = table[i][remainingBudget];
      const scoreWithoutItem = table[i - 1][remainingBudget];

      if (scoreWithItem !== scoreWithoutItem) {
        const chosenItem = scoredItems[i - 1];
        optimalOrder.push(chosenItem);
        
        remainingBudget -= chosenItem.price;
      }
    }

    // convert back to dollars
    const finalOrder = optimalOrder.map(item => ({
      ...item,
      price: item.price / 100,
    }));

res.send(finalOrder);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    await client.end();
  }
}