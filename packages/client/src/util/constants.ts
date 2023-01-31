import { EntityID } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";

export const BlockKey = {
  //landscape blocks
  Water: "Water",
  Sandstone: "Sandstone",
  Biofilm: "Biofilm",
  Alluvium: "Alluvium",
  Regolith: "Regolith",
  Bedrock: "Bedrock",
  Air: "Air",

  //metal ores
  Lithium: "Lithium",
  Iron: "Iron",
  Copper: "Copper",
  Titanium: "Titanium",
  Iridium: "Iridium",
  Osmium: "Osmium",
  Tungsten: "Tungsten",

  //mineral ores
  Kimberlite: "Kimberlite",
  Uraninite: "Uraninite",
  Bolutite: "Bolutite",
};

export const BlockType = {
  //landscape blocks
  Water: keccak256("block.Water") as EntityID,
  Sandstone: keccak256("block.Sandstone") as EntityID,
  Biofilm: keccak256("block.Biofilm") as EntityID,
  Alluvium: keccak256("block.Alluvium") as EntityID,
  Regolith: keccak256("block.Regolith") as EntityID,
  Bedrock: keccak256("block.Bedrock") as EntityID,
  Air: keccak256("block.Air") as EntityID,

  //metal ores
  Lithium: keccak256("block.Lithium") as EntityID,
  Iron: keccak256("block.Iron") as EntityID,
  Copper: keccak256("block.Copper") as EntityID,
  Titanium: keccak256("block.Titanium") as EntityID,
  Iridium: keccak256("block.Iridium") as EntityID,
  Osmium: keccak256("block.Osmium") as EntityID,
  Tungsten: keccak256("block.Tungsten") as EntityID,

  //mineral ores
  Kimberlite: keccak256("block.Kimberlite") as EntityID,
  Ludenite: keccak256("block.Uraninite") as EntityID,
  Bolutite: keccak256("block.Bolutite") as EntityID,
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

// Terrain Tile colors
//todo: pick ore block colors
export const BlockColors = new Map<string, string>([
  //landscape blocks
  ["Water", "#0369a1"],
  ["Sandstone", "#a8a29e"],
  ["Biofilm", "#10b981"],
  ["Alluvium", "#34d399"],
  ["Regolith", "#71717a"],
  ["Bedrock", "#52525b"],
  ["Air", "#FFFFFF00"],

  //metal ores
  ["Lithium", "#d8b4fe"],
  ["Iron", "#44403c"],
  ["Copper", "#047857"],
  ["Titanium", "#60a5fa"],
  ["Iridium", "#fce7f3"],
  ["Osmium", "#164e63"],
  ["Tungsten", "#94a3b8"],


  //mineral ores
  ["Kimberlite", "#e0f2fe"],
  ["Uraninite", "#d9f99d"],
  ["Bolutite", "#a21caf"],
]);
