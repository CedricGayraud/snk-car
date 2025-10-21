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
  const interpolatedFrames: {
    x: number;
    y: number;
    t: number;
    angle: number;
  }[] = [];

  // --- 1️⃣ On génère des positions intermédiaires pour la fluidité ---
  const subSteps = 6; // plus élevé = plus fluide
  for (let i = 0; i < chain.length - 1; i++) {
    const curr = chain[i];
    const next = chain[i + 1];

    const x1 = getHeadX(curr) * sizeCell;
    const y1 = getHeadY(curr) * sizeCell;
    const x2 = getHeadX(next) * sizeCell;
    const y2 = getHeadY(next) * sizeCell;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    for (let j = 0; j < subSteps; j++) {
      const k = j / subSteps;
      interpolatedFrames.push({
        x: x1 + dx * k,
        y: y1 + dy * k,
        t: (i + k) / chain.length,
        angle,
      });
    }
  }

  // --- 2️⃣ Création des keyframes SVG fluide ---
  const keyframes = interpolatedFrames.map(({ t, x, y, angle }) => ({
    t,
    style: `transform:translate(${x}px,${y}px) rotate(${angle}deg)`,
  }));

  const animationName = "carMove";
  const styles = [
    createAnimation(animationName, keyframes),
    `
    .car {
      animation: ${animationName} ${duration * 3.2}ms linear infinite;
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
