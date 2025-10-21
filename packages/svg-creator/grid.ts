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
  const vibreurHeight = o.sizeCell * 0.45;
  const stripeWidth = o.sizeCell * 0.45;
  const outerMargin = o.sizeCell * 0.05;
  const innerMargin = o.sizeCell * 0.05;
  const outlineWidth = o.sizeCell * 0.05;

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

  // --- 🎨 Vibreurs rouges/blancs ---
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

  // --- 🧱 Fond global (piste, marges, vibreurs) ---
  const base = `
    <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#000"/>
    <rect x="${outlineWidth}" y="${outlineWidth}" 
          width="${totalW - outlineWidth * 2}" height="${totalH - outlineWidth * 2}" fill="#FFF"/>

    <!-- Vibreurs -->
    <rect x="${outlineWidth + outerMargin}" y="${outlineWidth + outerMargin}"
          width="${totalW - (outlineWidth + outerMargin) * 2}" height="${vibreurHeight}" fill="url(#kerb)"/>
    <rect x="${outlineWidth + outerMargin}" 
          y="${totalH - (outlineWidth + outerMargin) - vibreurHeight}"
          width="${totalW - (outlineWidth + outerMargin) * 2}" height="${vibreurHeight}" fill="url(#kerb)"/>

    <!-- Marges intérieures -->
    <rect x="${gridX}" y="${gridY - innerMargin}" width="${gridW}" height="${innerMargin}" fill="#FFF"/>
    <rect x="${gridX}" y="${gridY + gridH}" width="${gridW}" height="${innerMargin}" fill="#FFF"/>

    <!-- Piste -->
    <rect x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}" fill="#484848"/>
  `;

  // --- 🎬 Animation contrôlée (au passage de la voiture uniquement) ---
  const colorMap: Record<number, string> = {
    0: "#484848",
    1: "#FFFFFF",
    2: "#D91E18",
    3: "#0062FF",
  };

  const styles: string[] = [
    `.cell {
      shape-rendering: geometricPrecision;
      stroke: #484848;
      stroke-width: 1px;
    }`
  ];

  const cellRects = cells.map(({ x, y, color, t }, i) => {
    const cx = gridX + (x - minX) * o.sizeCell + (o.sizeCell - o.sizeDot) / 2;
    const cy = gridY + (y - minY) * o.sizeCell + (o.sizeCell - o.sizeDot) / 2;
    const r = o.sizeDotBorderRadius;
    const fill = colorMap[color as number] ?? o.colorEmpty;

    const id = t !== null ? `cell${i.toString(36)}` : null;

    if (id) {
      const animName = id;
      const tNum = t as number; // ✅ conversion sûre

      styles.push(
        createAnimation(animName, [
          { t: Math.max(0, tNum - 0.001), style: `fill:${fill}` },
          { t: tNum, style: `fill:#484848` },
          { t: 1, style: `fill:#484848` },
        ]),
        `.cell.${id}{ animation:${animName} ${duration}ms linear infinite; }`
      );
    }


    return `<rect 
      x="${cx}" y="${cy}" 
      width="${o.sizeDot}" height="${o.sizeDot}" 
      rx="${r}" ry="${r}" 
      fill="${fill}" 
      class="cell ${id || ""}"/>`;
  }).join("");

  return {
    svgElements: [defs, base, `<g clip-path="url(#gridClip)">${cellRects}</g>`],
    styles,
  };
};
