# Order Optimizer

![demo](https://github.com/user-attachments/assets/f65b5b46-a8b9-4172-b22a-847450e33cd3)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

A web-based tool that generates optimal fast-food orders based on your budget, preferences, and variety score using the 0/1 knapsack algorithm.

## Tech Stack
- **Frontend**: React + TypeScript
- **Backend**: TypeScript, Node.js with PostgreSQL
- **Styling**: CSS with glassmorphism effectsm, React Particles + custom SVG filters
- **Deployment**: Vercel

## How to Use
In-browser:
- Go to [order-optimizer.vercel.app](https://order-optimizer.vercel.app/)
- Set your budget in the input field
- Browse the menu and give a 👍 to items you like
- Click Generate to get your optimized order
- Your order appears with the total price


Locally:
### Prerequisites
- Node.js and npm installed
- PostgreSQL database
- Environment variable for `DATABASE_URL`

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/JustinDodemaide/order-optimizer.git
cd order-optimizer
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Set up the database**
```bash
cd backend/database
npm install
npm run setup
```

4. **Create a `.env` file with:**
```
DATABASE_URL=your_postgresql_connection_string
```

5. **Start the development server**
```bash
npm run dev
```

6. Go to `http://localhost:3000` in your browser

## How It Works

The goal of the optimizer is to maximize the preference score while staying within the budget. This is an example of a combinatorial optimization problem, and their are many dynamic programming solutions. The 0-1 knapsack algorithm suits the needs of this project.

### Main Algorithm
The optimizer uses a standard 0/1 knapsack algorithm, with modifications to accodomate the variety scoring. The modification makes more sense after the main algorithm is described, so I'll start there:

```
// Input:
// Values (stored in array v)
// Weights (stored in array w)
// Number of distinct items (n)
// Knapsack capacity (W)
// NOTE: The array "v" and array "w" are assumed to store all relevant values starting at index 1.

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
```
[Source](https://en.wikipedia.org/wiki/Knapsack_problem#0-1_knapsack_problem)

1. We make the list of items using the scores that were passed in from the client (remembering to convert from dollar to cents, because the algorithm only works with integers).

```
const scoredItems:ScoredItem[] = [];

const result = await client.query('SELECT * FROM menu_items');
const menuItems = result.rows;

for (const item of menuItems) {
    const userScore = scores[item.id];
    if(userScore === undefined)
        continue;
    const itemPriceInCents = Math.round(item.price * 100);
    let numInstances = Math.floor(budgetInCents / itemPriceInCents);

    for (let instance = 1; instance <= numInstances; instance++){
        const itemCopy = {...item, instance} // keep track of the instance for the backtracking step

    // **This is the modification I'll describe later**
    itemCopy.score = userScore * Math.pow(Math.E, -varietyScale * variety * (instance - 1));
    itemCopy.price = itemPriceInCents;
    if(itemCopy.score < 0){
        itemCopy.score = 0;
    }

    scoredItems.push(itemCopy);
    }
}
```

2. Then, we create the knapsack algorithm table. Iterate through each scored item. If adding the item to the column would exceed the budget, then don't add the item. If the item fits in the budget, then add it to the current combination. Take the maximum between the combination WITH this item, and the combination WITHOUT this item.
```
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
```

3. Finally, we backtrack through the table to match the table entries with the their corresponding menu items so we can return the final order to the client (remembering to convert back to dollars from cents).
```
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
```

### Variety Depreciation
Now, we can circle back to the variety modification.
There's two main versions of the algorithm: 0/1 and unbounded. In the 0/1 version, items can only be included in the combination once; in the unbounded version, items could be included multiple times. Its pretty typical to order the same item more than once, so the initial version used the unbounded algorithm. However, the final order was usually just a dozen of the cheapest menu item. While mathematically correct, I would be underwhelmed if I was served 18 soft tacos. But, their are people who might not have a problem with that, and people who might want a middle option. I needed a way to determine how much repetition was acceptable. Thus, the variety score slider.

Interestingly, I found that the best way to accomodate multiple items was to switch to the 0/1 version of the algorithm. In the unbounded version, multiple items could be selected, but getting the algorithm to understand that the desirability of repeated items needs to depreciate at different rates depending on a parameter proved difficult. Instead, multiple instances of the item are added to the scoredItems list, with each recurring instance receiving a lower score. If the user doesn't like variety, then the scores are lowered sharply; if the user likes variety, the decrease is more shallow.

Example:
- Instance 1 - Score 1.00
- Instance 2 - Score 0.80
- Instance 3 - Score 0.50
- Instance 4 - Score 0.25
- Instance 5 - Score 0.10

That means I needed a function that could take the initial score and give a new, lower, non-zero score based on a slope between 1 and 5. After some trial and error, I landed on
```
value = userScore * e ^ (-scale * varietyScore * (instance - 1))
```
[Here's the function visualized in Desmos.](https://www.desmos.com/calculator/62wnlreoka) It gives us a curve that increases in depth more or less sharply depending on the variety score, v, and has a horizontal asymptote at so negative numbers don't break the algorithm.

Now, a user has more say in how much repetition they get in their optimized order.

## What I Learned

- **Dynamic programming and diminishing returns modeling** - Implemented the 0/1 knapsack algorithm and developed an exponential decay function
- **State management in React** - Learned to manage component states and asynchronous operations between frontend and backend
- **Modern CSS and React APIs** - Applied glassmorphism effects and integrated/customized tsparticles for interactive visuals
- **Backend development with databases and RESTful APIs** - Built API endpoints with Node.js and learned SQL for PostgreSQL database functionality
- **Project config and deployment** - Configured environments for different language versions and deployed using Vercel's serverless architecture

## Potential Features

- Ability to choose other restaurants
- Ability to optimize based on calories/macros instead of just budget
- Preference persistence - ability to make an account so users don't have to enter preferences each time
- User accounts to store and reorder favorites
- Dietary restrictions - Filter for vegetarian, vegan, gluten-free options
- Automatic menu updates - Implement parse.bot to scrape restaurant websites and add menu items to the database

## Acknowledgments

- **React Particles** - For the background effects
- **Taco Bell** - Menu data
