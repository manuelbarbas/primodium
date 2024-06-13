import { initGame } from "@/api";

export type PrimodiumGame = Awaited<ReturnType<typeof initGame>>;

export type CameraConfig = {
  pinchSpeed: number;
  wheelSpeed: number;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
};

type PackConfig = {
  image: Array<{
    key: string;
    url: string;
  }>;
  audioSprite: Array<{
    key: string;
    urls: string[];
    jsonURL: string;
  }>;
  atlas: Array<{
    key: string;
    textureURL: string;
    atlasURL: string;
  }>;
  tilemapTiledJSON: Array<{
    key: string;
    url: string;
  }>;
  bitmapFont: Array<{
    key: string;
    textureURL: string;
    fontDataURL: string;
  }>;
};

export type Key = keyof typeof Phaser.Input.Keyboard.KeyCodes | "POINTER_LEFT" | "POINTER_RIGHT";

export type GameConfig = Phaser.Types.Core.GameConfig & {
  key: string;
  assetPack: PackConfig;
};

export type LayerConfig = Record<string, { depth: number }>;
export type TilemapConfig = Record<string, LayerConfig>;

export type Animation = {
  key: string;
  assetKey: string;
  startFrame: number;
  endFrame: number;
  frameRate: number;
  // Number of times to repeat the animation, -1 for infinity
  repeat: number;
  prefix?: string;
  suffix?: string;
};

export interface SceneConfig {
  key: string;
  camera: CameraConfig;
  animations?: Animation[];
  cullingChunkSize: number;
  tilemap: {
    tileWidth: number;
    tileHeight: number;
    defaultKey?: string;
    config?: TilemapConfig;
  };
}

export interface TileAnimation {
  key: string;
  frames: number[];
}

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Coord = {
  x: number;
  y: number;
};

export type PixelCoord = Coord;
export type TileCoord = Coord;
export type ChunkCoord = Coord;
export type WorldCoord = Coord;
