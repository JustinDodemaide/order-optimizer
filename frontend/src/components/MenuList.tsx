import React from 'react';
import MenuItem from './MenuItem.tsx';

interface Item {
  id: number;
  name: string;
  price: number;
}

interface Ratings {
  [key: number]: number;
}

interface MenuListProps {
  items: Item[];
  ratings: Ratings;
  onRateItem: (itemId: number) => void;
}

const MenuList: React.FC<MenuListProps> = ({ items, ratings, onRateItem }) => {
  return (
    <div className="menu-items">
      {items.map(item => (
        <MenuItem
          key={item.id}
          item={item}
          isLiked={ratings[item.id] === 1}
          onRate={() => onRateItem(item.id)}
        />
      ))}
    </div>
  );
};

export default MenuList;