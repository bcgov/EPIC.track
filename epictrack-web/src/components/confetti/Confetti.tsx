import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  displayType?: "confetti" | "fireworks";
}

const Confetti = ({ displayType = "confetti" }: ConfettiProps) => {
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const animateConfetti = () => {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: displayType === "fireworks" ? 180 : 360, // wider spread
        ticks: 60,
        zIndex: 0,
      };

      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        setTimeout(confetti.reset, 1000); // Add a delay before clearing the confetti
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      // First point of explosion
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.3, y: 0.5 }, // left of the screen
      });
      // Second point of explosion
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.7, y: 0.5 }, // right of the screen
      });

      timeout = setTimeout(animateConfetti, 250);
    };

    animateConfetti();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [displayType]); // re-run the effect when displayType changes

  return null;
};
export default Confetti;
