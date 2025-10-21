import { getColor } from "@snk/types/grid";
import { pathRoundedRect } from "./pathRoundedRect";
import type { Grid, Color } from "@snk/types/grid";
import type { Point } from "@snk/types/point";

type Options = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorDotBorder: string;
  sizeCell: number;
  sizeDot: number;
  sizeDotBorderRadius: number;
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  _cells: Point[] | null,
  o: Options,
) => {
  // --- ⚙️ Paramètres du rendu ---
  const vibreurHeight = 13;       // hauteur du vibreur rouge/blanc
  const stripeWidth = 13;         // largeur d'une bande rouge/blanche
  const outerMargin = 3;          // marge blanche extérieure
  const innerMargin = 3;          // marge blanche intérieure (entre vibreur et grille)
  const outlineWidth = 1;         // bordure noire extérieure

  const totalWidth = grid.width * o.sizeCell;
  const totalHeight = grid.height * o.sizeCell;
  const canvasWidth = totalWidth + (outlineWidth + outerMargin) * 2;
  const canvasHeight = totalHeight + (vibreurHeight + innerMargin + outerMargin + outlineWidth) * 2;

  // Nettoyage
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // --- Bordure noire extérieure ---
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // --- Marge blanche extérieure ---
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(
    outlineWidth,
    outlineWidth,
    canvasWidth - outlineWidth * 2,
    canvasHeight - outlineWidth * 2
  );
  ctx.restore();

  // --- Création du pattern rouge/blanc ---
  const stripeCanvas = document.createElement("canvas");
  stripeCanvas.width = stripeWidth * 2;
  stripeCanvas.height = stripeWidth * 2;
  const stripeCtx = stripeCanvas.getContext("2d")!;

  stripeCtx.fillStyle = "#D91E18"; // rouge
  stripeCtx.fillRect(0, 0, stripeWidth, stripeCanvas.height);
  stripeCtx.fillStyle = "#FFFFFF"; // blanc
  stripeCtx.fillRect(stripeWidth, 0, stripeWidth, stripeCanvas.height);

  const pattern = ctx.createPattern(stripeCanvas, "repeat")!;

  // --- 🔹 Vibreur en haut ---
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(
    outlineWidth + outerMargin,
    outlineWidth + outerMargin,
    canvasWidth - (outlineWidth + outerMargin) * 2,
    vibreurHeight
  );
  ctx.restore();

  // --- Vibreur en bas ---
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(
    outlineWidth + outerMargin,
    canvasHeight - (outlineWidth + outerMargin) - vibreurHeight,
    canvasWidth - (outlineWidth + outerMargin) * 2,
    vibreurHeight
  );
  ctx.restore();

  // --- 🔹 Marge blanche intérieure (entre vibreur et grille) ---
  const gridX = outlineWidth + outerMargin;
  const gridY = outlineWidth + outerMargin + vibreurHeight + innerMargin;
  const gridH = totalHeight;
  const gridW = totalWidth;

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(gridX, gridY - innerMargin, gridW, innerMargin); // haut
  ctx.fillRect(gridX, gridY + gridH, gridW, innerMargin);       // bas
  ctx.restore();

  // --- 🔹 Fond gris du quadrillage ---
  ctx.save();
  ctx.fillStyle = "#484848";
  ctx.fillRect(gridX, gridY, gridW, gridH);
  ctx.restore();

  // --- 🔹 Quadrillage principal ---
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.height; y++) {
      const gridValue = getColor(grid, x, y);

      const colorMap: Record<number, string> = {
        0: "#484848", // fond gris piste
        1: "#FFF", // blanc faible contribution
        2: "#D91E18", // rouge contribution moyenne
        3: "#0062FF", // bleu grosse contribution
      };

      let color = colorMap[gridValue] ?? o.colorEmpty;
      
      ctx.save();
      ctx.translate(
        gridX + x * o.sizeCell + (o.sizeCell - o.sizeDot) / 2,
        gridY + y * o.sizeCell + (o.sizeCell - o.sizeDot) / 2,
      );

      ctx.fillStyle = color;
      ctx.strokeStyle = o.colorDotBorder || "#484848";
      ctx.lineWidth = 1;

      ctx.beginPath();
      pathRoundedRect(ctx, 0, 0, o.sizeDot, o.sizeDot, o.sizeDotBorderRadius);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      ctx.restore();
    }
  }
};
