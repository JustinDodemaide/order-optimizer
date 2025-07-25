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
    fpsLimit: 60,
    /*
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
          duration: 0.4,
        },
      },
    },
    */
    particles: {
      color: {
        value: ['#702082', '#E7248F', '#3B2B4B'],
      },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: {
          default: 'out' as const,
        },
        random: true,
        speed: 2,//isOptimizing ? 4 : 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 40,
      },
      opacity: {
        value: 0.6,
        animation: {
          enabled: true,
          speed: 1,
          minimumValue: 0.3,
          sync: false
        }
      },
      shape: {
        type: 'circle' as const,
      },
      size: {
        value: { min: 50, max: 150 },
        animation: {
          enable: true,
          speed: 3,
          minimumValue: 50,
          sync: false,
        },
      },
      shadow:{
        blur:100,
        color: {
          value:'#E7248F',
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

  return <Particles id="tsparticles" init={customInit} options={particleOptions} />;
};

export default ParticleBackground;