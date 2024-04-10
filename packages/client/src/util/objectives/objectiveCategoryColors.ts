import { ObjectiveCategory } from "./types";

export const objectiveCategoryColors: Record<ObjectiveCategory, string> = {
  // fundamentals
  Fundamentals: "bg-primary",
  Fleet: "bg-green-800",

  // military
  Conquest: "bg-green-700",
  Combat: "bg-green-700",
  Defense: "bg-green-800",

  // winning
  "Victory (Primodium)": "bg-secondary",
  "Victory (Wormhole)": "bg-secondary",

  // production
  Motherlode: "bg-yellow-700", // yellow-600
  "Unit Production": "bg-yellow-800", // yellow-700
  "Resource Production": "bg-yellow-700", // yellow-600

  // infra
  Market: "bg-blue-600", // amber-500

  // other
  Alliance: "bg-rose-700",
};
