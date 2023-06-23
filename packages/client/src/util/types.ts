import { Step } from "walktour";
import type config from "../game/config/mainSceneConfig";
import type createGame from "../engine/lib/createGame";
import type createScene from "../engine/lib/createScene";
import { Animation } from "@latticexyz/phaserx/dist/types";

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
export type Scene = Awaited<ReturnType<typeof createScene>>;

export interface GameObject {
  id: string;
  data: typeof Phaser.GameObjects.GameObject;
  onAdd: (scene: Phaser.Scene) => void;
  onUpdate: (time: number, delta: number) => void;
  dispose: () => void;
}

export interface TileAnimation {
  key: string;
  frames: number[];
}

export interface SceneConfig {
  key: string;
  assetPackUrl: string;
  camera: {
    minZoom: number;
    maxZoom: number;
    pinchSpeed: number;
    scrollSpeed: number;
    defaultZoom: number;
    dragSpeed: number;
  };
  animations?: Animation<any>[];
  tileAnimations?: TileAnimation[];
  animationInterval: number;
  cullingChunkSize: number;
  tilemap: {
    chunkSize: number;
    tileWidth: number;
    tileHeight: number;
  };
}
