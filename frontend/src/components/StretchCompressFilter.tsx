import React from 'react';

const StretchCompressFilter = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="lava-filter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.005 0.01" 
            numOctaves="1" 
            seed="2" 
          >
            <animate 
              attributeName="baseFrequency" 
              dur="20s" 
              values="0.01 0.02;0.015 0.025;0.01 0.02" 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          
          <feDisplacementMap in="SourceGraphic" scale="40" />
        </filter>
      </defs>
    </svg>
  );
};

export default StretchCompressFilter;