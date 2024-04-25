import { ObjectiveCategory } from "./types";

export const objectiveCategoryColors: Record<ObjectiveCategory, string> = {
  // fundamentals
  Fundamentals: "bg-primary",
  Fleet: "bg-primary",

  // military
  Conquest: "bg-green-700",
  Combat: "bg-green-700",
  Defense: "bg-green-800",

  // winning
  "Victory (Primodium)": "bg-secondary",
  "Victory (Wormhole)": "bg-secondary",

  // units
  "Unit Production": "bg-slate-700",
  "Unit Management": "bg-slate-700",
  "Unit Storage": "bg-slate-700",

  // resources
  Motherlode: "bg-yellow-700",
  "Resource Production": "bg-yellow-700",

  // infra
  Market: "bg-blue-600",

  // other
  Alliance: "bg-rose-700",
};
