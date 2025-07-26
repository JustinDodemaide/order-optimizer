import React from 'react';


interface BudgetControlProps {
  budget: string;
  setBudget: (value: string) => void;
}

const BudgetControl: React.FC<BudgetControlProps> = ({ budget, setBudget }) => {
  return (
    <div className="budget-section glass">
      <label>Budget: $</label>
      <input
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        min="1"
        step="0.01"
      />
    </div>
  );
};

export default BudgetControl;