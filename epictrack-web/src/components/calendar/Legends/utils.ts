import { WORK_LEGEND_COLOURS } from "../constants";

// Persist map for the session
const workColorMap: Record<string, string> = {};
let nextColorIndex = 0;

// Given a work ID or name, return its assigned colour
export function getWorkColour(workName: string): string {
  if (workColorMap[workName]) {
    return workColorMap[workName];
  }
  if (nextColorIndex < WORK_LEGEND_COLOURS.length) {
    workColorMap[workName] = WORK_LEGEND_COLOURS[nextColorIndex];
    nextColorIndex++;
    return workColorMap[workName];
  }
  // All colours used fallback
  const hash = Array.from(workName).reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const index = hash % WORK_LEGEND_COLOURS.length;
  workColorMap[workName] = WORK_LEGEND_COLOURS[index];
  return workColorMap[workName];
}

export function darkenHex(hex: string, amount: number): string {
  let col = hex.startsWith("#") ? hex.slice(1) : hex;
  if (col.length === 3) {
    col = col
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(col, 16);
  let r = (num >> 16) - amount * 255;
  let g = ((num >> 8) & 0x00ff) - amount * 255;
  let b = (num & 0x0000ff) - amount * 255;

  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
