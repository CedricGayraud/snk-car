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
  const subSteps = 6; // interpolation fluide
  const frames: { x: number; y: number; t: number; angle: number }[] = [];

  for (let i = 0; i < chain.length - 1; i++) {
    const x1 = getHeadX(chain[i]) * sizeCell;
    const y1 = getHeadY(chain[i]) * sizeCell;
    const x2 = getHeadX(chain[i + 1]) * sizeCell;
    const y2 = getHeadY(chain[i + 1]) * sizeCell;

    const angle1 = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const angle2 =
      i < chain.length - 2
        ? (Math.atan2(
            getHeadY(chain[i + 2]) * sizeCell - y2,
            getHeadX(chain[i + 2]) * sizeCell - x2,
          ) *
            180) /
          Math.PI
        : angle1;

    for (let j = 0; j < subSteps; j++) {
      const k = j / subSteps;
      frames.push({
        x: x1 + (x2 - x1) * k,
        y: y1 + (y2 - y1) * k,
        t: (i + k) / chain.length,
        angle: angle1 + (angle2 - angle1) * k, // interpolation angulaire
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
      animation: ${animationName} ${duration * 2}ms linear infinite;
      transform-box: fill-box;
      transform-origin: center center;
    }
    `,
  ];

  // --- 3️⃣ SVG Renault F1 (taille ×4) ---
  const carSvg = `
    <g class="car">
      <!-- Carrosserie principale -->
      <path d="M-26.4,-10 L-4.8,-10 L21.6,-6.4 L26.4,0 L21.6,6.4 L-4.8,10 L-26.4,10 Z" fill="#FFD500"/>

      <!-- Bande blanche -->
      <path d="M19.2,-2.4 L19.2,2.4 L-26.4,4.8 L-26.4,-4.8 Z" fill="#FFFFFF"/>

      <!-- Cockpit noir -->
      <path d="M-4.8,-2.8 Q16.8,0 -4.8,2.8 Z" fill="#111"/>

      <!-- Aileron avant noir -->
      <rect x="26.4" y="-6" width="3.2" height="12" fill="#111"/>

      <!-- Aileron arrière noir -->
      <rect x="-29.6" y="-6" width="5.6" height="12" fill="#111"/>

      <!-- Nez blanc avec pointe rouge -->
      <path d="M12.8,-2 L28.8,-0.8 L29.6,0 L28.8,0.8 L12.8,2 Z" fill="#FFFFFF"/>
      <path d="M28.8,-0.8 L29.6,0 L28.8,0.8 L29.6,0 Z" fill="#D10000"/>

      <!-- Prise d’air noire -->
      <rect x="-12.8" y="-2" width="3.2" height="4" fill="#222"/>

      <!-- Roues arrière -->
      <ellipse cx="-19.2" cy="-8.4" rx="3.2" ry="1.6" fill="#111"/>
      <ellipse cx="-19.2" cy="8.4" rx="3.2" ry="1.6" fill="#111"/>

      <!-- Roues avant -->
      <ellipse cx="19.2" cy="-5.6" rx="2.4" ry="1.2" fill="#111"/>
      <ellipse cx="19.2" cy="5.6" rx="2.4" ry="1.2" fill="#111"/>
    </g>
  `;

  return { svgElements: [carSvg], styles };
};
