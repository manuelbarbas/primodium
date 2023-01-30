import { EntityID } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";

export const BlockKey = {
  Water: "Water",

  Lithium: "Lithium",
  Regolith: "Regolith",
  Sandstone: "Sandstone",
  Alluvium: "Alluvium",

  Biofilm: "Biofilm",
  Kyronium: "Kyronium",
  Titanium: "Titanium",
  Teranomite: "Teranomite",

  LithiumMiner: "LithiumMiner",
};

export const BlockType = {
  Water: keccak256("block.Water") as EntityID,

  Lithium: keccak256("block.Lithium") as EntityID,
  Regolith: keccak256("block.Regolith") as EntityID,
  Sandstone: keccak256("block.Sandstone") as EntityID,
  Alluvium: keccak256("block.Alluvium") as EntityID,
  Biofilm: keccak256("block.Biofilm") as EntityID,
  Kyronium: keccak256("block.Kyronium") as EntityID,
  Titanium: keccak256("block.Titanium") as EntityID,
  Teranomite: keccak256("block.Teranomite") as EntityID,

  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,
};

// From OPCraft
export type BlockTypeKey = keyof typeof BlockType;

export const BlockIdToIndex = Object.values(BlockType).reduce<{
  [key: string]: number;
}>((acc, id, index) => {
  acc[id] = index;
  return acc;
}, {});

export const BlockIndexToId = Object.values(BlockType).reduce<{
  [key: number]: string;
}>((acc, id, index) => {
  acc[index] = id;
  return acc;
}, {});

export const BlockIndexToKey = Object.entries(BlockType).reduce<{
  [key: number]: BlockTypeKey;
}>((acc, [key], index) => {
  acc[index] = key as BlockTypeKey;
  return acc;
}, {});

export const BlockIdToKey = Object.entries(BlockType).reduce<{
  [key: EntityID]: BlockTypeKey;
}>((acc, [key, id]) => {
  acc[id] = key as BlockTypeKey;
  return acc;
}, {});

// Terrain Tiles
export const BlockColors = new Map<string, string>([
  ["Water", "#0369a1"],

  ["Lithium", "#d1d5db"],
  ["Regolith", "#71717a"],
  ["Sandstone", "#fef9c3"],
  ["Alluvium", "#4ade80"],
  ["Biofilm", "#22c55e"],
  ["Kyronium", "#cffafe"],
  ["Titanium", "#a3a3a3"],
  ["Teranomite", "#d9f99d"],

  ["LithiumMiner", "ff23742"],
]);
