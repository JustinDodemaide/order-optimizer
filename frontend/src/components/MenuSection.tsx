import React from 'react';
import MenuList from './MenuList.tsx';

interface Item {
  id: number;
  name: string;
  price: number;
}

interface Ratings {
  [key: number]: number;
}

interface MenuSectionProps {
  menuItems: Item[];
  ratings: Ratings;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRateItem: (itemId: number) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  ratings,
  searchTerm,
  onSearchChange,
  onRateItem
}) => {
  return (
    <div className="menu-section">
      <div className="menu-header">
        <h2>Menu</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <MenuList items={menuItems} ratings={ratings} onRateItem={onRateItem} />
    </div>
  );
};

export default MenuSection;