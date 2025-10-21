import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";

export type Options = {
  colorSnake: string;
  sizeCell: number;
};

export const createSnake = (
  chain: Snake[],
  o: Options,
  duration: number
) => {
  const frameDelay = duration / Math.max(chain.length, 1);

  const frames = chain.map((snake, i) => {
    const x = getHeadX(snake);
    const y = getHeadY(snake);
    const next = chain[Math.min(i + 1, chain.length - 1)];
    const nx = getHeadX(next);
    const ny = getHeadY(next);

    const angle = Math.atan2(ny - y, nx - x);
    const deg = (angle * 180) / Math.PI;
    const px = x * o.sizeCell + o.sizeCell / 2;
    const py = y * o.sizeCell + o.sizeCell / 2;

    return `
      <g transform="translate(${px}, ${py}) rotate(${deg}) scale(1.3)">
        <!-- carrosserie jaune -->
        <path d="M -22 -8 L -4 -10 L 18 -6 L 26 0 L 18 6 L -4 10 L -22 8 Z" fill="#FFD500"/>

        <!-- nez blanc + pointe rouge -->
        <path d="M 10 -5 L 26 -2 L 28 0 L 26 2 L 10 5 Z" fill="#FFF"/>
        <circle cx="27" cy="0" r="2.2" fill="#D10000"/>

        <!-- cockpit noir -->
        <path d="M -6 -4 Q 8 0 -6 4 Z" fill="#111"/>

        <!-- aileron avant -->
        <rect x="22" y="-7" width="8" height="14" fill="#111"/>

        <!-- aileron arrière -->
        <rect x="-28" y="-9" width="8" height="18" fill="#111"/>

        <!-- pneus (arrière plus larges) -->
        <ellipse cx="-16" cy="-10" rx="7" ry="4" fill="#111"/>
        <ellipse cx="-16" cy="10"  rx="7" ry="4" fill="#111"/>
        <ellipse cx="12"  cy="-9"  rx="5" ry="3" fill="#111"/>
        <ellipse cx="12"  cy="9"   rx="5" ry="3" fill="#111"/>
      </g>
      <animateTransform attributeName="transform" attributeType="XML"
        type="translate"
        from="${px} ${py}" to="${px} ${py}"
        dur="${duration}ms" begin="${i * frameDelay}ms" repeatCount="indefinite"/>
    `;
  }).join("");

  return {
    svgElements: [ `<g id="snake-car">${frames}</g>` ],
    styles: [
      `#snake-car { animation: none linear ${duration}ms infinite; }`
    ],
  };
};
