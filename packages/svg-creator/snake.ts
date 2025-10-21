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
  // --- 1️⃣ Récupère positions + angle lissé ---
  let lastAngle = 0;

  const headData = chain.map((snake, i, arr) => {
    const x = getHeadX(snake) * sizeCell;
    const y = getHeadY(snake) * sizeCell;

    let angleDeg = lastAngle;
    if (i < arr.length - 1) {
      const next = arr[i + 1];
      const dx = getHeadX(next) - getHeadX(snake);
      const dy = getHeadY(next) - getHeadY(snake);
      const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // interpolation douce : on amortit la rotation
      angleDeg = lastAngle + (rawAngle - lastAngle) * 0.25;
      lastAngle = angleDeg;
    }

    return { x, y, t: i / arr.length, angle: angleDeg };
  });

  // --- 2️⃣ Animation fluide (translation + rotation lissée) ---
  const keyframes = headData.map(({ t, x, y, angle }) => ({
    t,
    style: `transform:translate(${x}px,${y}px) rotate(${angle}deg)`,
  }));

  const animationName = "carMove";
  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      animation: ${animationName} ${duration * 1.5}ms linear infinite;
      transform-origin: center;
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
