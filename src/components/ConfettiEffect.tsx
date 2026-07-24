import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useTracker } from "@/store/useTracker";

export function ConfettiEffect() {
  const justLeveledUp = useTracker((s) => s.justLeveledUp);
  const clearLevelUp = useTracker((s) => s.clearLevelUp);
  const fired = useRef(false);

  useEffect(() => {
    if (justLeveledUp && !fired.current) {
      fired.current = true;

      // Fire confetti from center
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#f59e0b", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#f59e0b", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Reset after animation
      setTimeout(() => {
        clearLevelUp();
        fired.current = false;
      }, duration + 500);
    }
  }, [justLeveledUp, clearLevelUp]);

  return null; // No DOM element, just side effects
}
