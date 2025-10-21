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
  const headPositions = chain.map((snake, i, { length }) => {
    const x = getHeadX(snake) * sizeCell;
    const y = getHeadY(snake) * sizeCell;
    return { x, y, t: i / length };
  });

  const keyframes = headPositions.map(({ t, x, y }) => ({
    t,
    style: `transform:translate(${x}px,${y}px)`,
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

  // 🎨 Version F1 Renault (simplifiée mais fidèle à ta version canvas)
  const carSvg = `
    <g class="car" transform="scale(0.8)">
      <!-- corps jaune -->
      <rect x="-6" y="-3" width="12" height="6" fill="#FFD500"/>
      <!-- cockpit noir -->
      <rect x="-2" y="-2" width="4" height="4" fill="#111"/>
      <!-- aileron avant -->
      <rect x="6" y="-2.5" width="2" height="5" fill="#111"/>
      <!-- aileron arrière -->
      <rect x="-8" y="-3" width="2" height="6" fill="#111"/>
      <!-- roues -->
      <circle cx="-4" cy="-3.5" r="1.5" fill="#111"/>
      <circle cx="-4" cy="3.5" r="1.5" fill="#111"/>
      <circle cx="4" cy="-3.5" r="1.2" fill="#111"/>
      <circle cx="4" cy="3.5" r="1.2" fill="#111"/>
      <!-- bande bleue -->
      <rect x="-4" y="-3" width="8" height="6" fill="none" stroke="#0055FF" stroke-width="0.6"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};
