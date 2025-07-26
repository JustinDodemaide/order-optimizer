import React from 'react';

interface OrderItem {
  name: string;
  price: number;
}

interface ResultsDisplayProps {
  order: OrderItem[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ order }) => {
  if (order.length === 0) {
    return null;
  }

  const totalPrice = order.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="results-section glass">
      {order.map((item, index) => (
        <span key={index} className="result-item">
          {item.name}{index < order.length - 1 ? ', ' : ''}
        </span>
      ))}
      <div className="total-price">
        Total: ${totalPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default ResultsDisplay;