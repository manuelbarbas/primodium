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

  // placeable blocks
  MainBase: "MainBase",
  LithiumMiner: "LithiumMiner",
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
  Uraninite: keccak256("block.Uraninite") as EntityID,
  Bolutite: keccak256("block.Bolutite") as EntityID,

  // Utility
  Miner: keccak256("block.Miner") as EntityID,
  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,

  // Resource
  MainBase: keccak256("block.MainBase") as EntityID,
  Conveyer: keccak256("block.Conveyer") as EntityID,
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
export const BlockColors = new Map<EntityID, string>([
  //landscape blocks
  [BlockType.Water, "#0369a1"],
  [BlockType.Sandstone, "#a8a29e"],
  [BlockType.Biofilm, "#10b981"],
  [BlockType.Alluvium, "#34d399"],
  [BlockType.Regolith, "#71717a"],
  [BlockType.Bedrock, "#52525b"],
  [BlockType.Air, "#FFFFFF00"],

  //metal ores
  [BlockType.Lithium, "#d8b4fe"],
  [BlockType.Iron, "#44403c"],
  [BlockType.Copper, "#047857"],
  [BlockType.Titanium, "#60a5fa"],
  [BlockType.Iridium, "#fce7f3"],
  [BlockType.Osmium, "#164e63"],
  [BlockType.Tungsten, "#94a3b8"],

  //mineral ores
  [BlockType.Kimberlite, "#e0f2fe"],
  [BlockType.Uraninite, "#d9f99d"],
  [BlockType.Bolutite, "#a21caf"],

  // Utility
  [BlockType.Miner, "#cf6664"],
  [BlockType.LithiumMiner, "#cf6664"],

  // Resource
  [BlockType.MainBase, "#8676c0"],

  [BlockType.Conveyer, "#ffcd00"],
]);

export const BackgroundImage = new Map<EntityID, string>([
  //landscape blocks
  [BlockType.Water, "../public/img/water.gif"],
  [BlockType.Sandstone, "../public/img/sandstone.png"],
  [BlockType.Biofilm, "../public/img/biofilm.png"],
  [BlockType.Alluvium, "../public/img/alluvium.png"],
  [BlockType.Regolith, "../public/img/regolith.png"],
  [BlockType.Bedrock, "../public/img/bedrock.png"],
  [BlockType.Air, "../public/img/air.png"],

  //metal ores
  [BlockType.Lithium, "../public/img/sandstone.png"],
  [BlockType.Iron, "../public/img/sandstone.png"],
  [BlockType.Copper, "../public/img/sandstone.png"],
  [BlockType.Titanium, "../public/img/sandstone.png"],
  [BlockType.Iridium, "../public/img/sandstone.png"],
  [BlockType.Osmium, "../public/img/sandstone.png"],
  [BlockType.Tungsten, "../public/img/sandstone.png"],

  //mineral ores
  [BlockType.Kimberlite, "../public/img/sandstone.png"],
  [BlockType.Uraninite, "../public/img/sandstone.png"],
  [BlockType.Bolutite, "../public/img/sandstone.png"],
]);

export type DisplayTile = {
  x: number;
  y: number;
};
