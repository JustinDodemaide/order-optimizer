import React from 'react';

interface VarietySliderProps {
  variety: number;
  setVariety: (value: number) => void;
}

const VarietySlider: React.FC<VarietySliderProps> = ({ variety, setVariety }) => {
  const getVarietyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Love duplicates';
      case 2: return 'Some duplicates';
      case 3: return 'Neutral';
      case 4: return 'More variety';
      case 5: return 'Max variety';
      default: return '';
    }
  };

  return (
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
        {getVarietyLabel(variety)}
      </span>
    </div>
  );
};

export default VarietySlider;