import confetti from "canvas-confetti";
import { PODIUM_COLORS } from "./podiumTheme";

export type ConfettiIntensity = "minimal" | "normal" | "big" | "huge";

const INTENSITY_CONFIG: Record<
  ConfettiIntensity,
  { particleCount: number; spread: number; startVelocity: number; colors?: string[] }
> = {
  minimal: { particleCount: 20, spread: 60, startVelocity: 35 },
  normal: { particleCount: 80, spread: 70, startVelocity: 55 },
  big: { particleCount: 110, spread: 80, startVelocity: 65 },
  huge: {
    particleCount: 150,
    spread: 90,
    startVelocity: 75,
    colors: [PODIUM_COLORS.gold, "#F5C542", "#ffffff"],
  },
};

export function fireWinnerConfetti(intensity: ConfettiIntensity = "normal"): void {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const config = INTENSITY_CONFIG[intensity];

  if (prefersReducedMotion) {
    confetti({
      particleCount: Math.round(config.particleCount / 2),
      spread: 60,
      startVelocity: 25,
      origin: { x: 0.5, y: 0.6 },
      colors: config.colors,
    });
    return;
  }

  if (intensity === "minimal") {
    confetti({ ...config, ticks: 200, origin: { x: 0.5, y: 0.6 }, angle: 90 });
    return;
  }

  const shared = { ...config, ticks: 200 };

  confetti({ ...shared, angle: 60, origin: { x: 0, y: 1 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 1 } });
}
