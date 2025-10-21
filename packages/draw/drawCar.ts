// import { pathRoundedRect } from "./pathRoundedRect";
import { snakeToCells } from "@snk/types/snake";
import type { Snake } from "@snk/types/snake";

type Options = {
  colorSnake: string;
  sizeCell: number;
  trail?: boolean;
};

// état global
let trailPoints: { x: number; y: number; opacity: number; angle: number; size: number }[] = [];
let lastAngle: number | null = null;
let wheelSteer = 0;
let wheelRotation = 0; // rotation continue des roues

export const drawCar = (
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  o: Options,
) => {
  const cells = snakeToCells(snake);
  const head = cells[0];
  const next = cells[1] ?? head;
  const size = o.sizeCell;

  // --- orientation ---
  const dx = head.x - next.x;
  const dy = head.y - next.y;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);
  wheelRotation += distance * 10; // contrôle de la rotation des roues

  if (lastAngle === null) lastAngle = angle;
  const angleDiff = Math.atan2(Math.sin(angle - lastAngle), Math.cos(angle - lastAngle));
  wheelSteer = wheelSteer * 0.85 + angleDiff * 0.9;
  lastAngle = angle;

  // --- traînée ---
  if (o.trail) {
    const tx = head.x - Math.cos(angle) * 0.6;
    const ty = head.y - Math.sin(angle) * 0.6;
    trailPoints.push({
      x: tx + (Math.random() - 0.5) * 0.2,
      y: ty + (Math.random() - 0.5) * 0.2,
      opacity: 0.7 + Math.random() * 0.2,
      angle,
      size: size * (0.25 + Math.random() * 0.15),
    });
    trailPoints = trailPoints
      .map((t) => ({ ...t, opacity: t.opacity - 0.02 }))
      .filter((t) => t.opacity > 0);
  }

  // --- traînée visuelle ---
  for (const t of trailPoints) {
    ctx.save();
    ctx.globalAlpha = t.opacity * 0.5;
    ctx.fillStyle = "rgba(80,80,80,0.3)";
    ctx.translate(t.x * size + size / 2, t.y * size + size / 2);
    ctx.rotate(t.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, t.size, t.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  
  // --- dessin Renault F1 Prost 1982 ---
ctx.save();
ctx.translate(head.x * size + size / 2, head.y * size + size / 2);
ctx.rotate(angle);
ctx.scale(1.5, 1.5);

// --- Carrosserie principale (jaune) ---
ctx.fillStyle = "#FFD500"; // jaune vif
ctx.beginPath();
ctx.moveTo(-size * 0.55, -size * 0.22);
ctx.lineTo(-size * 0.10, -size * 0.22);
ctx.lineTo(size * 0.45, -size * 0.14);
ctx.lineTo(size * 0.55, 0);

ctx.lineTo(size * 0.45, size * 0.14);
ctx.lineTo(-size * 0.10, size * 0.22);
ctx.lineTo(-size * 0.55, size * 0.22);
ctx.closePath();
ctx.fill();

//Bande blanche
ctx.fillStyle = "#FFFFFF";
ctx.beginPath();
ctx.moveTo(size * 0.4, -size * 0.055);     // avant (nez)
ctx.lineTo(size * 0.4, size * 0.055);
ctx.lineTo(-size * 0.55, size * 0.11);     // arrière bas
ctx.lineTo(-size * 0.55, -size * 0.11);    // arrière haut
ctx.closePath();
ctx.fill();


// --- Cockpit noir ---
ctx.fillStyle = "#111";
ctx.beginPath();
ctx.moveTo(-size * 0.1, -size * 0.06);
ctx.quadraticCurveTo(size * 0.35, 0, -size * 0.1, size * 0.06);
ctx.closePath();
ctx.fill();

// --- Aileron avant large et noir ---
ctx.save();
ctx.translate(size * 0.56, 0);
ctx.fillStyle = "#111";
ctx.fillRect(-size * 0.05, -size * 0.20, size * 0.1, size * 0.40);
ctx.restore();

// --- Aileron arrière noir ---
ctx.save();
ctx.translate(-size * 0.6, 0);
ctx.fillStyle = "#111";
ctx.fillRect(-size * 0.07, -size * 0.20, size * 0.14, size * 0.40);
ctx.restore();

// --- Nez blanc avec pointe rouge ---
const noseGradient = ctx.createLinearGradient(size * 0.25, 0, size * 0.68, 0);
noseGradient.addColorStop(0, "#FFFFFF");
noseGradient.addColorStop(0.8, "#FFFFFF");
noseGradient.addColorStop(1, "#D10000"); // rouge à l’extrémité
ctx.fillStyle = noseGradient;

ctx.beginPath();
ctx.moveTo(size * 0.28, -size * 0.06);
ctx.lineTo(size * 0.68, -size * 0.03);
ctx.lineTo(size * 0.70, 0);
ctx.lineTo(size * 0.68, size * 0.03);
ctx.lineTo(size * 0.28, size * 0.06);
ctx.closePath();
ctx.fill();

// --- Prise d’air noire derrière cockpit ---
ctx.fillStyle = "#222";
ctx.fillRect(-size * 0.25, -size * 0.08, size * 0.07, size * 0.16);

// --- Roues ---
const drawWheel = (x: number, y: number, steer = false, rear = false) => {
  ctx.save();
  ctx.translate(x, y);
  if (steer) ctx.rotate(wheelSteer * 1.2);
  const tireWidth = rear ? size * 0.14 : size * 0.10;
  const tireHeight = rear ? size * 0.08 : size * 0.06;
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 0, tireWidth, tireHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Roues arrière larges
drawWheel(-size * 0.40, -size * 0.24, false, true);
drawWheel(-size * 0.40, size * 0.24, false, true);

// Roues avant plus fines et avancées
drawWheel(size * 0.40, -size * 0.155, true);
drawWheel(size * 0.40, size * 0.155, true);

ctx.restore();
};
