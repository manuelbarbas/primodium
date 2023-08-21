import { CoordMap } from "@latticexyz/utils";
import {
  Assets,
  TilesetConfig,
  WorldCoord,
} from "@latticexyz/phaserx/dist/types";

export interface ChunkedTilemap<
  TileKeys extends number,
  LayerKeys extends string
> {
  size: () => number;
  putTileAt: (
    coord: WorldCoord,
    tile: TileKeys,
    layer?: LayerKeys,
    tint?: number,
    alpha?: number
  ) => void;
  dispose: () => void;
  setVisible: (visible: boolean) => void;
  visible: { current: boolean };
  tileWidth: number;
  tileHeight: number;
}

export interface VirtualTilemap<
  TileKeys extends number,
  LayerKeys extends string
> extends ChunkedTilemap<TileKeys, LayerKeys> {
  tiles: { [key in LayerKeys]: CoordMap<Tile> };
}

export declare type LayerConfig<
  A extends Assets,
  T extends TilesetConfig<A>
> = {
  [key: string]: {
    tilesets: (keyof T & string)[];
    depth?: number;
    hasHueTintShader?: boolean;
    hasLightShader?: boolean;
  };
};

export interface AnimatedTilemap<
  TileKeys extends number,
  LayerKeys extends string,
  AnimationKeys extends string
> extends VirtualTilemap<TileKeys, LayerKeys> {
  putAnimationAt: (
    coord: WorldCoord,
    animationKey: AnimationKeys,
    layer?: LayerKeys,
    alpha?: number
  ) => void;
  removeAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
  pauseAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
  resumeAnimationAt: (coord: WorldCoord, layer?: LayerKeys) => void;
  registerAnimation: (
    animationKey: AnimationKeys,
    frames: TileAnimation<TileKeys>
  ) => void;
}

export type Tile = {
  index: number;
  tint?: number;
  alpha?: number;
};

export type TileAnimation<TileKeys extends number> = TileKeys[];
