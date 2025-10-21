import type { Color, Empty } from "@snk/types/grid";
import type { Point } from "@snk/types/point";
import { createAnimation } from "./css-utils";

export type Options = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorDotBorder: string;
  sizeCell: number;
  sizeDot: number;
  sizeDotBorderRadius: number;
};

export const createGrid = (
  cells: (Point & { t: number | null; color: Color | Empty })[],
  o: Options,
  duration: number
) => {
  // --- ⚙️ Paramètres généraux ---
  const vibreurHeight = 13;
  const stripeWidth = 13;
  const outerMargin = 3;
  const innerMargin = 3;
  const outlineWidth = 1;

  const xs = cells.map(c => c.x);
  const ys = cells.map(c => c.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const gridW = (maxX - minX + 1) * o.sizeCell;
  const gridH = (maxY - minY + 1) * o.sizeCell;

  const totalW = gridW + (outlineWidth + outerMargin) * 2;
  const totalH = gridH + (vibreurHeight + innerMargin + outerMargin + outlineWidth) * 2;

  const gridX = outlineWidth + outerMargin;
  const gridY = outlineWidth + outerMargin + vibreurHeight + innerMargin;

  // --- 🎨 Définition des motifs (vibreurs rouges/blancs) ---
  const defs = `
    <defs>
      <pattern id="kerb" patternUnits="userSpaceOnUse" width="${stripeWidth * 2}" height="${vibreurHeight}">
        <rect x="0" y="0" width="${stripeWidth}" height="${vibreurHeight}" fill="#D91E18"/>
        <rect x="${stripeWidth}" y="0" width="${stripeWidth}" height="${vibreurHeight}" fill="#FFFFFF"/>
      </pattern>
      <clipPath id="gridClip">
        <rect x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}"/>
      </clipPath>
    </defs>
  `;

  // --- 🧱 Fond global (bordures + piste + vibreurs) ---
  const base = `
    <!-- Bordure noire extérieure -->
    <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#000"/>

    <!-- Marge blanche extérieure -->
    <rect x="${outlineWidth}" y="${outlineWidth}" 
          width="${totalW - outlineWidth * 2}" height="${totalH - outlineWidth * 2}" fill="#FFF"/>

    <!-- Vibreur haut -->
    <rect x="${outlineWidth + outerMargin}" y="${outlineWidth + outerMargin}"
          width="${totalW - (outlineWidth + outerMargin) * 2}" height="${vibreurHeight}" fill="url(#kerb)"/>

    <!-- Vibreur bas -->
    <rect x="${outlineWidth + outerMargin}" 
          y="${totalH - (outlineWidth + outerMargin) - vibreurHeight}"
          width="${totalW - (outlineWidth + outerMargin) * 2}" height="${vibreurHeight}" fill="url(#kerb)"/>

    <!-- Marges blanches intérieures -->
    <rect x="${gridX}" y="${gridY - innerMargin}" width="${gridW}" height="${innerMargin}" fill="#FFF"/>
    <rect x="${gridX}" y="${gridY + gridH}" width="${gridW}" height="${innerMargin}" fill="#FFF"/>

    <!-- Fond gris piste -->
    <rect x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}" fill="#484848"/>
  `;

  // --- 🎬 Animation dynamique des cellules ---
  const styles: string[] = [
    `.cell {
      shape-rendering: geometricPrecision;
      stroke: #484848;
      stroke-width: 1px;
      animation: none ${duration}ms linear infinite;
    }`
  ];

  const cellRects = cells.map(({ x, y, color, t }, i) => {
    const cx = gridX + (x - minX) * o.sizeCell + (o.sizeCell - o.sizeDot) / 2;
    const cy = gridY + (y - minY) * o.sizeCell + (o.sizeCell - o.sizeDot) / 2;
    const r = o.sizeDotBorderRadius;

    // Palette simplifiée
    const colorMap: Record<number, string> = {
      0: "#484848", // piste
      1: "#FFFFFF", // faible
      2: "#D91E18", // moyenne
      3: "#0062FF", // forte
    };
    const fill = colorMap[color as number] ?? o.colorEmpty;

    const id = t && "cell" + i.toString(36);

    // Animation : quand la voiture passe (t), la case devient gris piste
    if (t !== null && id) {
      const animName = id;
      styles.push(
        createAnimation(animName, [
          { t: t - 0.0001, style: `fill:${fill}` },
          { t: t + 0.0001, style: `fill:#484848` },
          { t: 1, style: `fill:#484848` },
        ]),
        `.cell.${id}{ animation-name:${animName}; }`
      );
    }

    return `<rect x="${cx}" y="${cy}" width="${o.sizeDot}" height="${o.sizeDot}"
                   rx="${r}" ry="${r}" fill="${fill}" class="cell ${id || ""}"/>`;
  }).join("");

  return {
    svgElements: [defs, base, `<g clip-path="url(#gridClip)">${cellRects}</g>`],
    styles,
  };
};
