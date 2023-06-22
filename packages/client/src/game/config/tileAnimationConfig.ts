// import type { Tilekeys } from "../../util/types";
import { TileAnimation } from "../../util/types";
import { Tilekeys, TileAnimationKeys } from "../constants";

const generateTileFrames = (tile: number, length: number) => {
  const frames = [];

  for (let i = 0; i < length; i++) {
    frames.push(tile + i);
  }

  return frames;
};

export const TileAnimationsConfig: TileAnimation[] = [
  {
    key: TileAnimationKeys.Water,
    frames: generateTileFrames(Tilekeys.Water, 49),
  },
];

export default TileAnimationsConfig;
