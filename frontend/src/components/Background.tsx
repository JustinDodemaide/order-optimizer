import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useSpring, animated } from '@react-spring/web';

const AnimatedParticles = ({ isGenerating }: { isGenerating: boolean }) => {
  // Morph particle behavior based on state
  const springProps = useSpring({
    particleSpeed: isGenerating ? 5 : 1,
    particleSize: isGenerating ? 4 : 2,
    config: { tension: 100, friction: 20 }
  });

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  return (
    <Particles
      init={particlesInit}
      options={{
        particles: {
          color: { value: ["#702082", "#E7248F"] },
          move: { speed: springProps.particleSpeed },
          size: { value: springProps.particleSize },
          // More config...
        }
      }}
    />
  );
};