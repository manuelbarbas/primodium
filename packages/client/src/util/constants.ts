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
  Electrum: "Electrum",
  Alvarium: "Alvarium",
  Kydonium: "Kydonium",
  Lethvium: "Lethvium",
  Titanium: "Titanium",
  Vandenium: "Vandenium",
  Iridium: "Iridium",

  //mineral ores
  Teranomite: "Teranomite",
  Hankite: "Hankite",
  Naberlite: "Naberlite",
  Gyratite: "Gyratite",
  Kimberlite: "Kimberlite",
  Ludenite: "Ludenite",
  Bolulite: "Bolutite",
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
  Electrum: keccak256("block.Electrum") as EntityID,
  Alvarium: keccak256("block.Alvarium") as EntityID,
  Kydonium: keccak256("block.Kydonium") as EntityID,
  Lethvium: keccak256("block.Lethvium") as EntityID,
  Titanium: keccak256("block.Titanium") as EntityID,
  Vandenium: keccak256("block.Vandenium") as EntityID,
  Iridium: keccak256("block.Iridium") as EntityID,

  //mineral ores
  Teranomite: keccak256("block.Teranomite") as EntityID,
  Hankite: keccak256("block.Hankite") as EntityID,
  Naberlite: keccak256("block.Naberlite") as EntityID,
  Gyratite: keccak256("block.Gyratite") as EntityID,
  Kimberlite: keccak256("block.Kimberlite") as EntityID,
  Ludenite: keccak256("block.Ludenite") as EntityID,
  Bolulite: keccak256("block.Bolulite") as EntityID,
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
  ["Water", "#0369a150"],
  ["Sandstone", "#a8a29e"],
  ["Biofilm", "#10b981"],
  ["Alluvium", "#34d399"],
  ["Regolith", "#71717a"],
  ["Bedrock", "#52525b"],
  ["Air", "#FFFFFF00"],

  //metal ores
  ["Lithium", "#d1d5db"],
  ["Iron", ""],
  ["Copper", ""],
  ["Electrum", ""],
  ["Alvarium", ""],
  ["Kydonium", "#cffafe"],
  ["Lethvium", ""],
  ["Titanium", "#a3a3a3"],
  ["Vandenium", ""],
  ["Iridium", ""],

  //mineral ores
  ["Teranomite", "#d9f99d"],
  ["Hankite", ""],
  ["Naberlite", ""],
  ["Gyratite", ""],
  ["Kimberlite", ""],
  ["Ludenite", ""],
  ["Bolutite", ""],
]);
