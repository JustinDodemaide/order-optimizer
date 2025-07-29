import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import { useOrderOptimizer } from './useOrderOptimizer.ts';

import BudgetEnterer from './components/BudgetEnterer.tsx';
import MenuSection from './components/MenuSection.tsx';
import VarietySlider from './components/VarietySlider.tsx';
import ResultsDisplay from './components/ResultsDisplay.tsx';
import Background from './components/Background.tsx';
import StretchCompressFilter from './components/StretchCompressFilter.tsx';

const API_URL = '/api';

function App():JSX.Element {
  const [menu, setMenu] = useState<any[]>([]);
  const [budget, setBudget] = useState('20');
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [variety, setVariety] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantId] = useState(1);

  const optimizerData = useOrderOptimizer();
  const optimalOrder = optimizerData.optimalOrder;
  const animationClass = optimizerData.animationClass;
  const optimizeOrder = optimizerData.optimizeOrder;

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        
        const menuWithNumericPrices = response.data.map((item: any) => ({...item, price: parseFloat(item.price),}));
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

  function handleGenerateClick() {
    const payload = {
      budget: parseFloat(budget),
      variety: variety,
      scores: ratings,
      restaurantId: restaurantId,
    };
    optimizeOrder(payload);
  }
  
  const filteredMenu = menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <StretchCompressFilter />
      <Background isOptimizing={animationClass === 'shrinking-effect'} />

      <div className="container">
        <h1>Order Optimizer</h1>
        <div className="instructions">
          Give your favorite items a thumbs up, set your budget and variety preference,
          then generate your optimal order!
        </div>

        <div className={animationClass}>
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

        <button className="generate-button glass" onClick={handleGenerateClick}>
          Generate
        </button>

        <ResultsDisplay order={optimalOrder} />
      </div>
    </div>
  );
}

export default App;