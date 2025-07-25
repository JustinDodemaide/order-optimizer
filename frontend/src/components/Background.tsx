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
        value: '#1a1a2e',
      },
    },
    fpsLimit: 60,
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
    particles: {
      color: {
        value: '#ffffff',
      },
      links: {
        color: '#ffffff',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: {
          default: 'bounce' as const,
        },
        random: false,
        speed: isOptimizing ? 12 : 3, // Dynamic speed
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: 'circle' as const,
      },
      size: {
        value: { min: 1, max: isOptimizing ? 8 : 4 }, // Dynamic size
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