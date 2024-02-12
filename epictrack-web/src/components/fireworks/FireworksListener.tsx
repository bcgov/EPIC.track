import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface FireworksListenerProps {
  progress: number;
}

const FireworksListener = ({ progress }: FireworksListenerProps) => {
  const hasPlayed = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const animateConfetti = () => {
      if (progress === 100 && !hasPlayed.current && !isFirstRender.current) {
        hasPlayed.current = true; // Mark the animation as having played

        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };

        const randomInRange = (min: number, max: number) =>
          Math.random() * (max - min) + min;

        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setTimeout(confetti.reset, 1000); // Add a delay before clearing the confetti
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.45), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
        });

        timeout = setTimeout(animateConfetti, 250);
      }
    };

    animateConfetti();

    isFirstRender.current = false; // Mark the first render as having completed

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [progress]);

  return null;
};

export default FireworksListener;
