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
    const userId = 1; // Placeholder

    const defaultRating = 3;
    Promise.all([
      axios.get('/menu'),
      axios.get(`/user/${userId}/ratings`)
    ])
    .then(([menuResponse, ratingsResponse]) => {
      const menuData = menuResponse.data;
      const userRatings = ratingsResponse.data;

      setMenu(menuData);

      // Set default rating for all items
      const defaultRatings: {[key: number]: number} = {};
      menuData.forEach((item: MenuItem) => {
        defaultRatings[item.id] = defaultRating;
      });

      // Then replace default rating with any user-specified ratings
      const initialRatings = { ...defaultRatings, ...userRatings };
      setRatings(initialRatings);
      
    })
    .catch(error => {
      console.error('Error fetching initial data:', error);
    });
  }, []);

  const optimizeOrder = () => {
    const varietyDecay = 1.0 - (variety * 0.15);
    
    axios.get(`/optimize/1/${budget}/${varietyDecay}`)
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
            onChange={(e) => {
              const newRating = parseInt(e.target.value);
              setRatings({...ratings, [item.id]: newRating});
              
              // save to database
              axios.put(`/user/1/rating/${item.id}`, { rating: newRating })
                .catch(error => console.error('Failed to save rating:', error));
            }}
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