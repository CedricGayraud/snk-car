import {
  getColor,
  isEmpty,
} from "@snk/types/grid";
import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";
import type { Grid, Color, Empty } from "@snk/types/grid";
import type { Point } from "@snk/types/point";
import type { AnimationOptions } from "@snk/gif-creator";
import { createSnake } from "./snake";
import { createGrid } from "./grid";
// import { createStack } from "./stack";
import { h } from "./xml-utils";
import { minifyCss } from "./css-utils";

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

  // ✅ Ne suit que la tête du snake
  for (let i = 0; i < chain.length; i++) {
    const headX = getHeadX(chain[i]);
    const headY = getHeadY(chain[i]);

    const cell = livingCells.find(c => c.x === headX && c.y === headY);
    if (cell && cell.t === null && !isEmpty(cell.color)) {
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
  const zoomFactor = 2;
  drawOptions.sizeCell *= zoomFactor;
  drawOptions.sizeDot *= zoomFactor;

  const width = (grid.width + 2) * drawOptions.sizeCell;
  const height = (grid.height + 5) * drawOptions.sizeCell;

  const duration = animationOptions.frameDuration * chain.length;

  const livingCells = createLivingCells(grid, chain, cells);

  const elements = [
    createGrid(livingCells, drawOptions, duration),
    createSnake(chain, drawOptions, duration),
  ];

  const viewBox = [
  -drawOptions.sizeCell,
  -drawOptions.sizeCell * 3, // ← passe de 2 à 3 pour ajouter un peu d’espace bas
  width,
  height + drawOptions.sizeCell * 2, // ← augmente la hauteur
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