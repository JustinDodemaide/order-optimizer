import React, { useCallback, useMemo } from 'react';
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

interface ParticleBackgroundProps {
  isOptimizing: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isOptimizing }) => {
  const particleOptions = useMemo(() => ({
    background: {
      color: {
        value: '#000000ff',
      },
    },
    fpsLimit: 30,
    
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 1.6,
        },
      },
    },
    
    particles: {
      color: {
        value: ['#c010e8ff', '#b82074ff', '#A93EFF'],
      },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: {
          default: 'out' as const,
        },
        random: true,
        speed: isOptimizing ? 2 : 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 60,
      },
      
      shape: {
        type: 'circle' as const,
      },
      size: {
        value: {min: 60, max: 140},
        animation: {
          enable: true,
          speed: 4,
          sync: false,
        },
      },
      shadow:{
        blur:100,
        color: {
          value:'#e40c83ff',
        },
        enable:true
      },
    },
    detectRetina: true,
  }), [isOptimizing]);

  // useCallback to ensure the function is not recreated on every render
  const customInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="particle-container">
      <Particles id="tsparticles" init={customInit} options={particleOptions} />
    </div>
  );
};

export default ParticleBackground;