import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  calories: number;
  score: number;
}

function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [budget, setBudget] = useState<string>('20');
  const [ratings, setRatings] = useState<{[key: number]: number}>({});
  const [variety, setVariety] = useState<number>(3);
  const [optimalOrder, setOptimalOrder] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/menu')
      .then(response => {
        setMenu(response.data);
        // Initialize ratings
        const initialRatings: {[key: number]: number} = {};
        response.data.forEach((item: MenuItem) => {
          initialRatings[item.id] = 3; // Default rating
        });
        setRatings(initialRatings);
      })
      .catch(error => {
        console.error('Error fetching menu:', error);
      });
  }, []);

  const optimizeOrder = () => {
    const varietyDecay = 1.0 - (variety * 0.15);
    
    // Variety value is still hardcoded at the endpoint for now
    axios.get(`/optimize/1/${budget}`)
      .then(response => {
        setOptimalOrder(response.data);
      })
      .catch(error => {
        console.error('Error optimizing:', error);
      });
  };

  return (
    <div className="App">
      <h1>Order Optimizer</h1>
      
      <div>
        <label>Budget: $</label>
        <input 
          type="number" 
          value={budget} 
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      <div>
        <label>Variety Preference: </label>
        <input
          type="range"
          min="1"
          max="5"
          value={variety}
          onChange={(e) => setVariety(parseInt(e.target.value))}
        />
        <span>{variety} (1=Duplicates OK, 5=Max Variety)</span>
      </div>

      <h2>Rate Menu Items (1-5):</h2>
      {menu.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <input
            type="range"
            min="1"
            max="5"
            value={ratings[item.id] || 3}
            onChange={(e) => setRatings({...ratings, [item.id]: parseInt(e.target.value)})}
          />
          <span>{ratings[item.id] || 3} stars</span>
        </div>
      ))}

      <button onClick={optimizeOrder}>Make order</button>

      {optimalOrder.length > 0 && (
        <div>
          <h2>Your Optimal Order:</h2>
          <pre>{JSON.stringify(optimalOrder, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;