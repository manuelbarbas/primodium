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

export interface GameObject {
  id: string;
  data: typeof Phaser.GameObjects.GameObject;
  onAdd: (scene: Phaser.Scene) => void;
  onUpdate: (time: number, delta: number) => void;
  dispose: () => void;
}
