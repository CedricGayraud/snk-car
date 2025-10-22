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
  const subSteps = 6;
  const frames: { x: number; y: number; t: number; angle: number }[] = [];

  let lastAngle = 0;

  for (let i = 0; i < chain.length - 1; i++) {
    const x1 = getHeadX(chain[i]) * sizeCell;
    const y1 = getHeadY(chain[i]) * sizeCell;
    const x2 = getHeadX(chain[i + 1]) * sizeCell;
    const y2 = getHeadY(chain[i + 1]) * sizeCell;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    // ✅ Ne tourne que quand direction change vraiment
    const delta = Math.abs(angle - lastAngle);
    if (delta > 3) lastAngle = angle;

    for (let j = 0; j < subSteps; j++) {
      const k = j / subSteps;
      frames.push({
        x: x1 + dx * k,
        y: y1 + dy * k,
        t: (i + k) / chain.length,
        angle: lastAngle,
      });
    }
  }

  const keyframes = frames.map(({ t, x, y, angle }) => ({
    t,
    style: `transform:translate(${x}px,${y}px) rotate(${angle}deg)`,
  }));

  const animationName = "carMove";
  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      animation: ${animationName} ${duration}ms linear infinite;
      transform-box: fill-box;
      transform-origin: 70% 50%; /* ✅ rotation sur l'avant */
    }
    `,
  ];

  const carSvg = `
    <g class="car">
      <path d="M-26.4,-10 L-4.8,-10 L21.6,-6.4 L26.4,0 L21.6,6.4 L-4.8,10 L-26.4,10 Z" fill="#FFD500"/>
      <path d="M19.2,-2.4 L19.2,2.4 L-26.4,4.8 L-26.4,-4.8 Z" fill="#FFFFFF"/>
      <path d="M-4.8,-2.8 Q16.8,0 -4.8,2.8 Z" fill="#111"/>
      <rect x="26.4" y="-6" width="3.2" height="12" fill="#111"/>
      <rect x="-29.6" y="-6" width="5.6" height="12" fill="#111"/>
      <path d="M12.8,-2 L28.8,-0.8 L29.6,0 L28.8,0.8 L12.8,2 Z" fill="#FFFFFF"/>
      <path d="M28.8,-0.8 L29.6,0 L28.8,0.8 L29.6,0 Z" fill="#D10000"/>
      <rect x="-12.8" y="-2" width="3.2" height="4" fill="#222"/>
      <ellipse cx="-19.2" cy="-8.4" rx="3.2" ry="1.6" fill="#111"/>
      <ellipse cx="-19.2" cy="8.4" rx="3.2" ry="1.6" fill="#111"/>
      <ellipse cx="19.2" cy="-5.6" rx="2.4" ry="1.2" fill="#111"/>
      <ellipse cx="19.2" cy="5.6" rx="2.4" ry="1.2" fill="#111"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};
