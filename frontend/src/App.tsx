import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import BudgetEnterer from './components/BudgetEnterer.tsx';
import MenuSection from './components/MenuSection.tsx';
import VarietySlider from './components/VarietySlider.tsx';
import ResultsDisplay from './components/ResultsDisplay.tsx';

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
  const [optimalOrder, setOptimalOrder] = useState<MenuItem[]>([]);
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


  const handleRating = (itemId: number) => {
    const currentRating = ratings[itemId] || 0;
    const newRating = currentRating === 1 ? 0.1 : 1;
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
    .catch(error => {
      console.error('Error optimizing order ', error);
    });
  };



  // search functionality
  const filteredMenu = menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


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

        <BudgetEnterer budget={budget} setBudget={setBudget} />

        <MenuSection menuItems={filteredMenu} ratings={ratings} searchTerm={searchTerm} onSearchChange={setSearchTerm} onRateItem={handleRating}/>

        <VarietySlider variety={variety} setVariety={setVariety} />


        <button className="generate-button" onClick={optimizeOrder}>
          Generate
        </button>

        <ResultsDisplay order={optimalOrder} />
      </div>
    </div>
  );
}

export default App;
