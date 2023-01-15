import { EntityID } from "@latticexyz/recs";
import { BlockType } from "../../constants";
import { TerrainState } from "./types";

export function Water(state: TerrainState): EntityID | undefined {
  // const {
  //   coord: { y },
  //   height,
  // } = state;
  return BlockType.Water;
}

export function Lithium(state: TerrainState): EntityID | undefined {
  return BlockType.Lithium;
}

export function Regolith(state: TerrainState): EntityID | undefined {
  return BlockType.Regolith;
}

export function Sandstone(state: TerrainState): EntityID | undefined {
  return BlockType.Sandstone;
}

export function Alluvium(state: TerrainState): EntityID | undefined {
  return BlockType.Alluvium;
}
