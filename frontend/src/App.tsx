import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = '/api'

interface MenuItem {
  id: number;
  name: string;
  price: number;
  calories: number;
  restaurant_id: number;
}

function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [budget, setBudget] = useState<string>('20');
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [variety, setVariety] = useState<number>(3);
  const [optimalOrder, setOptimalOrder] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantId] = useState(1); // hardcoded until multiple menus are added


  useEffect(() => {
    axios.get(API_URL + '/menu')
      .then(response => {
        // convert price to a number
        const menuWithNumericPrices = response.data.map((item: any) => ({
          ...item,
          price: parseFloat(item.price)
        }));
        setMenu(menuWithNumericPrices);
      })
      .catch(error => {
        console.error('Error fetching menu:', error);
      });
  }, []);


  const handleRating = (itemId: number, currentRating: number) => {
    const newRating = currentRating === 1 ? 0.1 : 1; // Toggle between 0 and 1
    setRatings({ ...ratings, [itemId]: newRating });
  };


  const optimizeOrder = () => {
    // Prepare the data for the post request
    const payload = {
      budget: parseFloat(budget),
      variety: variety,
      scores: ratings,
      restaurantId: restaurantId,
    };

    axios.post(API_URL + '/optimize', payload)
      .then(response => {
        // convert price to a number
        const orderWithNumericPrices = response.data.map((item: any) => ({
          ...item,
          price: parseFloat(item.price),
        }));
        setOptimalOrder(orderWithNumericPrices);
    })
  };



  // search functionality
  const filteredMenu = menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // determine the CSS class for a menu item based on its rating (green or grey)
  const getRatingClass = (itemId: number) => {
    return ratings[itemId] === 1 ? 'liked' : '';
  };

  return (
    <div className="App">
      {/* Add the lava lamp elements here, as a background */}
      <div className="lava-lamp">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="container">
        <h1>Order Optimizer</h1>

        <div className="instructions">
          Give your favorite items a thumbs up, set your budget and variety preference,
          then generate your optimal order!
        </div>

        <div className="budget-section">
          <label>Budget: $</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="1"
            step="0.01"
          />
        </div>

        <div className="menu-section">
          <div className="menu-header">
            <h2>Menu</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="menu-items">
            {filteredMenu.map(item => (
              <div key={item.id} className={`menu-item ${getRatingClass(item.id)}`}>
                <span className="item-name">{item.name} - ${item.price.toFixed(2)}</span>
                <div className="rating-buttons">
                  <button
                    className={`thumb-up ${ratings[item.id] === 1 ? 'active' : ''}`}
                    onClick={() => handleRating(item.id, ratings[item.id] || 0)}
                  >
                    👍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="variety-section">
          <label>Variety: </label>
          <input
            type="range"
            min="1"
            max="5"
            value={variety}
            onChange={(e) => setVariety(parseInt(e.target.value))}
            className="variety-slider"
          />
          <span className="variety-label">
            {variety === 1 ? 'Love duplicates':
              variety === 2 ? 'Some duplicates':
              variety === 3 ? 'Neutral':
              variety === 4 ? 'More variety':
              variety === 5 ? 'Max variety' :
                ''}
          </span>
        </div>

        <button className="generate-button" onClick={optimizeOrder}>
          Generate
        </button>

        {optimalOrder.length > 0 && (
          <div className="results-section">
            {optimalOrder.map((item, index) => (
              <span key={index} className="result-item">
                {item.name}{index < optimalOrder.length - 1 ? ', ' : ''}
              </span>
            ))}
            <div className="total-price">
              Total: ${optimalOrder.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
