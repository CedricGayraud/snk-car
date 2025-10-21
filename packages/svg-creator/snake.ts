import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";
import { createAnimation } from "./css-utils";

export type Options = {
  colorSnake: string;
  sizeCell: number;
  sizeDot: number;
};

export const createSnake = (
  chain: Snake[],
  { sizeCell }: Options,
  duration: number,
) => {
  // --- Récupère les positions et les angles ---
  const headData = chain.map((snake, i, arr) => {
    const x = getHeadX(snake) * sizeCell;
    const y = getHeadY(snake) * sizeCell;

    let angleDeg = 0;
    if (i < arr.length - 1) {
      const next = arr[i + 1];
      const dx = getHeadX(next) - getHeadX(snake);
      const dy = getHeadY(next) - getHeadY(snake);
      angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    }

    return { x, y, t: i / arr.length, angle: angleDeg };
  });

  // --- Animation fluide ---
  const keyframes = headData.map(({ t, x, y, angle }) => ({
    t,
    style: `transform:translate(${x}px,${y}px) rotate(${angle}deg)`,
  }));

  const animationName = "carMove";
  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      animation: ${animationName} ${duration * 1.3}ms linear infinite;
      transform-origin: center;
    }
    `,
  ];

  // --- Taille dynamique selon la grille ---
  const scale = sizeCell / 10 * 5; // 5x la taille d’une cellule moyenne

  const carSvg = `
    <g class="car" transform="scale(${scale})">
      <!-- Carrosserie principale -->
      <path d="M-6.6,-2.5 L-1.2,-2.5 L5.4,-1.6 L6.6,0 L5.4,1.6 L-1.2,2.5 L-6.6,2.5 Z" fill="#FFD500"/>

      <!-- Bande blanche -->
      <path d="M4.8,-0.6 L4.8,0.6 L-6.6,1.2 L-6.6,-1.2 Z" fill="#FFFFFF"/>

      <!-- Cockpit noir -->
      <path d="M-1.2,-0.7 Q4.2,0 -1.2,0.7 Z" fill="#111"/>

      <!-- Aileron avant noir -->
      <rect x="6.6" y="-1.5" width="0.8" height="3" fill="#111"/>

      <!-- Aileron arrière noir -->
      <rect x="-7.4" y="-1.5" width="1.4" height="3" fill="#111"/>

      <!-- Nez blanc avec pointe rouge -->
      <path d="M3.2,-0.5 L7.2,-0.2 L7.4,0 L7.2,0.2 L3.2,0.5 Z" fill="#FFFFFF"/>
      <path d="M7.2,-0.2 L7.4,0 L7.2,0.2 L7.4,0 Z" fill="#D10000"/>

      <!-- Prise d’air noire -->
      <rect x="-3.2" y="-0.5" width="0.8" height="1" fill="#222"/>

      <!-- Roues arrière -->
      <ellipse cx="-4.8" cy="-2.1" rx="0.8" ry="0.4" fill="#111"/>
      <ellipse cx="-4.8" cy="2.1" rx="0.8" ry="0.4" fill="#111"/>

      <!-- Roues avant -->
      <ellipse cx="4.8" cy="-1.4" rx="0.6" ry="0.3" fill="#111"/>
      <ellipse cx="4.8" cy="1.4" rx="0.6" ry="0.3" fill="#111"/>

      <!-- Liseré bleu -->
      <rect x="-4.5" y="-2.5" width="9" height="5" fill="none" stroke="#0055FF" stroke-width="0.3"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};
