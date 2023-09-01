import { TileAnimation } from "engine/types";
import { AsteroidMap } from "../../constants";

const { TileKeys: Tilekeys, TileAnimationKeys } = AsteroidMap;

const generateTileFrames = (tile: number, length: number) => {
  const frames = [];

  for (let i = 0; i < length; i++) {
    frames.push(tile + i);
  }

  return frames;
};

export const tileAnimationConfig: TileAnimation[] = [
  {
    key: TileAnimationKeys.Water,
    frames: generateTileFrames(Tilekeys.Water, 49),
  },
];
