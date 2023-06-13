import { Step } from "walktour";
import type config from "../game/config";
import type createGame from "../game/createGame";

export type BlockTypeActionComponent = {
  action: () => void;
};

export type SimpleCardinal = "up" | "down" | "left" | "right";

export interface TourStep extends Step {
  narration?: JSX.Element;
  hideUI?: boolean;
}

export type GameConfig = typeof config;

export enum Scenes {
  MAIN = "MAIN",
}

export type Game = Awaited<ReturnType<typeof createGame>>;

export enum TerrainTileset {
  Air,
  Alluvium,
  Bedrock,
  Biofilm,
  Regolith,
  Sandstone,
  Water,
}

export enum ResourceTileset {
  Bolutite,
  Copper,
  Iridium,
  Iron,
  Kimberlite,
  Lithium,
  Osmium,
  Titanium,
  Tungsten,
  Uraninite,
}
