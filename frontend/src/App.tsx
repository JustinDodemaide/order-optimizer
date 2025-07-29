import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import BudgetEnterer from './components/BudgetEnterer';
import MenuSection from './components/MenuSection';
import VarietySlider from './components/VarietySlider';
import ResultsDisplay from './components/ResultsDisplay';
import Background from './components/Background';
import StretchCompressFilter from './components/StretchCompressFilter';

const API_URL = '/api';

function App(): JSX.Element {
  const [menu, setMenu] = useState<any[]>([]);
  const [budget, setBudget] = useState('20');
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [variety, setVariety] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantId] = useState(1);
  
  const [optimalOrder, setOptimalOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        const menuWithNumericPrices = response.data.map((item: any) => ({ ...item, price: parseFloat(item.price) }));
        setMenu(menuWithNumericPrices);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    }
    fetchMenu();
  }, []);

  function handleRating(itemId: number) {
    const currentRating = ratings[itemId] || 0;
    const newRating = currentRating === 1 ? 0.1 : 1;
    setRatings({ ...ratings, [itemId]: newRating });
  }

  async function generateOptimalOrder(payload: any) {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/optimize`, payload);
      const orderWithNumericPrices = response.data.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
      }));
      setOptimalOrder(orderWithNumericPrices);
    } catch (error) {
      console.error('Error optimizing order:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGenerateClick() {
    const payload = {
      budget: parseFloat(budget),
      variety: variety,
      scores: ratings,
      restaurantId: restaurantId,
    };
    generateOptimalOrder(payload);
  }
  
  const filteredMenu = menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <StretchCompressFilter />
      <Background isOptimizing={isLoading} />

      <div className="container">
        <h1>Order Optimizer</h1>
        <div className="instructions">
          Give your favorite items a thumbs up, set your budget and variety preference,
          then generate your optimal order!
        </div>

        <div>
          <BudgetEnterer budget={budget} setBudget={setBudget} />
          <MenuSection
            menuItems={filteredMenu}
            ratings={ratings}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRateItem={handleRating}
          />
          <VarietySlider variety={variety} setVariety={setVariety} />
        </div>

        <button
          className="generate-button glass"
          onClick={handleGenerateClick}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>

        <ResultsDisplay order={optimalOrder} />
      </div>
    </div>
  );
}

export default App;