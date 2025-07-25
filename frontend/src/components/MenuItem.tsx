import React from 'react';

interface Item {
  id: number;
  name: string;
  price: number;
}

interface MenuItemProps {
  item: Item;
  isLiked: boolean;
  onRate: (itemId: number) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isLiked, onRate }) => {
  const itemClass = isLiked ? 'menu-item liked' : 'menu-item';
  const buttonClass = isLiked ? 'thumb-up active' : 'thumb-up';

  return (
    <div className={itemClass}>
      <span className="item-name">{item.name} - ${item.price.toFixed(2)}</span>
      <div className="rating-buttons">
        <button className={buttonClass} onClick={() => onRate(item.id)}>
          👍
        </button>
      </div>
    </div>
  );
};

export default MenuItem;