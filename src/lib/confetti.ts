import confetti from "canvas-confetti";

export function fireWinnerConfetti(): void {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    confetti({
      particleCount: 40,
      spread: 60,
      startVelocity: 25,
      origin: { x: 0.5, y: 0.6 },
    });
    return;
  }

  const shared = {
    particleCount: 80,
    spread: 70,
    startVelocity: 55,
    ticks: 200,
  };

  confetti({ ...shared, angle: 60, origin: { x: 0, y: 1 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 1 } });
}
