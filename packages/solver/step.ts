import {
  Color,
  getColor,
  Grid,
  isEmpty,
  isInside,
  setColor,
} from "@snk/types/grid";
import { getHeadX, getHeadY, Snake } from "@snk/types/snake";

export const step = (grid: Grid, stack: Color[], snake: Snake) => {
  const x = getHeadX(snake);
  const y = getHeadY(snake);
  const color = getColor(grid, x, y);

  if (isInside(grid, x, y) && !isEmpty(color)) {
    stack.push(color);
   setColor(grid, x, y, 5 as Color);
  }
};
