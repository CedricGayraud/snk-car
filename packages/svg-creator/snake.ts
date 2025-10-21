import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";
import { createAnimation } from "./css-utils";

export type Options = {
  colorSnake: string;
  sizeCell: number;
  sizeDot: number;
};

const transform = (x: number, y: number) =>
  `transform:translate(${x}px,${y}px)`;

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
    style: transform(x, y),
  }));

  const animationName = "carMove";
  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      fill: none;
      stroke: none;
      animation: ${animationName} ${duration}ms linear infinite;
    }
    `,
  ];

  // 🏎️ Forme de la F1 (simple path stylisé, mais tu peux garder ton rendu complet ici)
  const carSvg = `
    <g class="car">
      <rect x="-6" y="-3" width="12" height="6" fill="#FFD500" stroke="#111" stroke-width="1"/>
      <rect x="-8" y="-1" width="16" height="2" fill="#111"/>
      <rect x="-2" y="-5" width="4" height="10" fill="#111"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};