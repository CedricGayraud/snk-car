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
  // Récupère la trajectoire de la tête du snake
  const headPositions = chain.map((snake, i, { length }) => {
    const x = getHeadX(snake) * sizeCell;
    const y = getHeadY(snake) * sizeCell;
    return { x, y, t: i / length };
  });

  // Animation de translation (déplacement du véhicule)
  const keyframes = headPositions.map(({ t, x, y }) => ({
    t,
    style: `transform:translate(${x}px,${y}px) rotate(0deg)`,
  }));

  const animationName = "carMove";

  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      animation: ${animationName} ${duration}ms linear infinite;
      transform-origin: center;
    }
    `,
  ];

  // 🏎️ SVG détaillé Renault F1 Prost 1982 (fidèle à ton drawCar)
  const carSvg = `
    <g class="car" transform="scale(1.2)">
      <!-- carrosserie principale (jaune vif) -->
      <path d="M-6.6,-2.5 L-1.2,-2.5 L5.4,-1.6 L6.6,0 L5.4,1.6 L-1.2,2.5 L-6.6,2.5 Z" fill="#FFD500"/>

      <!-- bande blanche -->
      <path d="M4.8,-0.6 L4.8,0.6 L-6.6,1.2 L-6.6,-1.2 Z" fill="#FFFFFF"/>

      <!-- cockpit noir -->
      <path d="M-1.2,-0.7 Q4.2,0 -1.2,0.7 Z" fill="#111"/>

      <!-- aileron avant noir -->
      <rect x="6.6" y="-1.5" width="0.8" height="3" fill="#111"/>

      <!-- aileron arrière noir -->
      <rect x="-7.4" y="-1.5" width="1.4" height="3" fill="#111"/>

      <!-- nez blanc avec pointe rouge -->
      <path d="M3.2,-0.5 L7.2,-0.2 L7.4,0 L7.2,0.2 L3.2,0.5 Z" fill="#FFFFFF"/>
      <path d="M7.2,-0.2 L7.4,0 L7.2,0.2 L7.4,0 Z" fill="#D10000"/>

      <!-- prise d’air noire -->
      <rect x="-3.2" y="-0.5" width="0.8" height="1" fill="#222"/>

      <!-- roues arrière larges -->
      <ellipse cx="-4.8" cy="-2.1" rx="0.8" ry="0.4" fill="#111"/>
      <ellipse cx="-4.8" cy="2.1" rx="0.8" ry="0.4" fill="#111"/>

      <!-- roues avant plus fines -->
      <ellipse cx="4.8" cy="-1.4" rx="0.6" ry="0.3" fill="#111"/>
      <ellipse cx="4.8" cy="1.4" rx="0.6" ry="0.3" fill="#111"/>

      <!-- contour bleu -->
      <rect x="-4.5" y="-2.5" width="9" height="5" fill="none" stroke="#0055FF" stroke-width="0.3"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};
