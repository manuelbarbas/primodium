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

export type Game = Awaited<ReturnType<typeof createGame>>;
