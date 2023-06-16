import {
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@smallbraingames/small-phaser";
import { Coord } from "@latticexyz/utils";
import config from "../game/config";

import { useGameStore } from "../store/GameStore";
import { useConfigStore } from "../store/ConfigStore";

export const pixelCoordToGameCoord = (coord: Coord) => {
  const { tileWidth, tileHeight } =
    useGameStore.getState().game?.mainScene.config.tilemap!;

  return pixelCoordToTileCoord(
    { x: coord.x, y: -coord.y },
    tileWidth,
    tileHeight
  );
};

export const gameCoordToPixelCoord = (coord: Coord) => {
  const { tileWidth, tileHeight } = config.tilemap;

  const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);

  return { x: pixelCoord.x, y: -pixelCoord.y };
};

export const gameCoordToTileCoord = (coord: Coord) => {
  return { x: coord.x, y: -coord.y };
};

export const gameCoordtoChunkCoord = (coord: Coord) => {
  const { chunkSize } = useConfigStore.getState().tilemap;

  return {
    x: Math.floor(coord.x / chunkSize),
    y: Math.floor(coord.y / chunkSize),
  };
};

//returns game coord of center of chunk
export const chunkCoordtoGameCoord = (coord: Coord) => {
  const { chunkSize } = useConfigStore.getState().tilemap;

  return {
    x: (coord.x + 0.5) * chunkSize - 8,
    y: (coord.y + 0.5) * chunkSize - 8,
  };
};
