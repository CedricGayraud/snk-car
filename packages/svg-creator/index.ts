import {
  copyGrid,
  getColor,
  isEmpty,
  isInside,
  setColorEmpty,
} from "@snk/types/grid";
import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";
import type { Grid, Color, Empty } from "@snk/types/grid";
import type { Point } from "@snk/types/point";
import type { AnimationOptions } from "@snk/gif-creator";
import { createStack } from "./stack";
import { h } from "./xml-utils";
import { minifyCss } from "./css-utils";
import { drawCar } from "@snk/draw/drawCar";
import { drawGrid } from "@snk/draw/drawGrid";

export type DrawOptions = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorDotBorder: string;
  colorSnake: string;
  sizeCell: number;
  sizeDot: number;
  sizeDotBorderRadius: number;
  dark?: {
    colorDots: Record<Color, string>;
    colorEmpty: string;
    colorDotBorder?: string;
    colorSnake?: string;
  };
};

const getCellsFromGrid = ({ width, height }: Grid) =>
  Array.from({ length: width }, (_, x) =>
    Array.from({ length: height }, (_, y) => ({ x, y })),
  ).flat();

const createLivingCells = (
  grid0: Grid,
  chain: Snake[],
  cells: Point[] | null,
) => {
  const livingCells: (Point & {
    t: number | null;
    color: Color | Empty;
  })[] = (cells ?? getCellsFromGrid(grid0)).map(({ x, y }) => ({
    x,
    y,
    t: null,
    color: getColor(grid0, x, y),
  }));

  const grid = copyGrid(grid0);
  for (let i = 0; i < chain.length; i++) {
    const snake = chain[i];
    const x = getHeadX(snake);
    const y = getHeadY(snake);

    if (isInside(grid, x, y) && !isEmpty(getColor(grid, x, y))) {
      setColorEmpty(grid, x, y);
      const cell = livingCells.find((c) => c.x === x && c.y === y)!;
      cell.t = i / chain.length;
    }
  }

  return livingCells;
};

export const createSvg = (
  grid: Grid,
  cells: Point[] | null,
  chain: Snake[],
  drawOptions: DrawOptions,
  animationOptions: Pick<AnimationOptions, "frameDuration">,
) => {
  const width = (grid.width + 2) * drawOptions.sizeCell;
  const height = (grid.height + 5) * drawOptions.sizeCell;

  const duration = animationOptions.frameDuration * chain.length;

  const livingCells = createLivingCells(grid, chain, cells);

const elements: {
  svgElements: string[];
  styles: string[];
}[] = [];

// 🧱 --- Grille personnalisée ---
// On crée un faux contexte Canvas pour exécuter ton drawGrid()
{
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  if (ctx) {
    // On dessine la grille dans ce contexte (aucun retour, juste rendu interne)
    drawGrid(ctx, grid, cells, drawOptions);
  }

  // On ajoute une simple balise de placeholder SVG
  // (car le contenu est dessiné dans le contexte, non renvoyé sous forme de string)
  elements.push({
    svgElements: [
      `<rect width="${(grid.width + 2) * drawOptions.sizeCell}" height="${(grid.height + 2) * drawOptions.sizeCell}" fill="#484848" />`,
    ],
    styles: [],
  });
}

// 🏁 --- Stack de contributions (optionnel, tu peux le supprimer si tu veux que ta grille soit statique)
elements.push(
  createStack(
    livingCells,
    drawOptions,
    grid.width * drawOptions.sizeCell,
    (grid.height + 2) * drawOptions.sizeCell,
    duration,
  )
);

// 🏎️ --- Voiture Renault (ton drawCar) ---
{
  const svgCarElements: string[] = [];
  for (let i = 0; i < chain.length; i++) {
    const snake = chain[i];

    // Ici on simule un contexte pour ton drawCar
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    if (ctx) {
      drawCar(ctx, snake, drawOptions);
    }

    // On crée une frame SVG temporelle (simple placeholder d’animation)
    svgCarElements.push(
      `<use href="#snake-car" style="animation-delay:${i * animationOptions.frameDuration}ms"/>`
    );
  }

  elements.push({
    svgElements: [
      `<g id="snake-car">`,
      ...svgCarElements,
      `</g>`,
    ],
    styles: [],
  });
}

  const viewBox = [
    -drawOptions.sizeCell,
    -drawOptions.sizeCell * 2,
    width,
    height,
  ].join(" ");

  const style =
    generateColorVar(drawOptions) +
    elements
      .map((e) => e.styles)
      .flat()
      .join("\n");

  const svg = [
    h("svg", {
      viewBox,
      width,
      height,
      xmlns: "http://www.w3.org/2000/svg",
    }).replace("/>", ">"),

    "<desc>",
    "Generated with https://github.com/Platane/snk",
    "</desc>",

    "<style>",
    optimizeCss(style),
    "</style>",

    ...elements.map((e) => e.svgElements).flat(),

    "</svg>",
  ].join("");

  return optimizeSvg(svg);
};

const optimizeCss = (css: string) => minifyCss(css);
const optimizeSvg = (svg: string) => svg;

const generateColorVar = (drawOptions: DrawOptions) =>
  `
    :root {
    --cb: ${drawOptions.colorDotBorder};
    --cs: ${drawOptions.colorSnake};
    --ce: ${drawOptions.colorEmpty};
    ${Object.entries(drawOptions.colorDots)
      .map(([i, color]) => `--c${i}:${color};`)
      .join("")}
    }
    ` +
  (drawOptions.dark
    ? `
    @media (prefers-color-scheme: dark) {
      :root {
        --cb: ${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};
        --cs: ${drawOptions.dark.colorSnake || drawOptions.colorSnake};
        --ce: ${drawOptions.dark.colorEmpty};
        ${Object.entries(drawOptions.dark.colorDots)
          .map(([i, color]) => `--c${i}:${color};`)
          .join("")}
      }
    }
`
    : "");
