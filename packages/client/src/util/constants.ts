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
  Miner: "Miner",

  Silo: "Silo",
};

export const BlockType = {
  // Landscape blocks
  Water: keccak256("block.Water") as EntityID,
  Sandstone: keccak256("block.Sandstone") as EntityID,
  Biofilm: keccak256("block.Biofilm") as EntityID,
  Alluvium: keccak256("block.Alluvium") as EntityID,
  Regolith: keccak256("block.Regolith") as EntityID,
  Bedrock: keccak256("block.Bedrock") as EntityID,
  Air: keccak256("block.Air") as EntityID,

  // Ores
  Lithium: keccak256("block.Lithium") as EntityID,
  Iron: keccak256("block.Iron") as EntityID,
  Copper: keccak256("block.Copper") as EntityID,
  Titanium: keccak256("block.Titanium") as EntityID,
  Iridium: keccak256("block.Iridium") as EntityID,
  Osmium: keccak256("block.Osmium") as EntityID,
  Tungsten: keccak256("block.Tungsten") as EntityID,
  Kimberlite: keccak256("block.Kimberlite") as EntityID,
  Uraninite: keccak256("block.Uraninite") as EntityID,
  Bolutite: keccak256("block.Bolutite") as EntityID,

  // Debug buildings
  MainBase: keccak256("block.MainBase") as EntityID,
  Conveyer: keccak256("block.Conveyer") as EntityID,
  Miner: keccak256("block.Miner") as EntityID,
  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,
  BulletFactory: keccak256("block.BulletFactory") as EntityID,
  Silo: keccak256("block.Silo") as EntityID,

  // Buildings
  BasicMiner: keccak256("block.BasicMiner") as EntityID,
  Node: keccak256("block.Node") as EntityID,
  PlatingFactory: keccak256("block.PlatingFactory") as EntityID,
  BasicBatteryFactory: keccak256("block.BasicBatteryFactory") as EntityID,
  KineticMissileFactory: keccak256("block.KineticMissileFactory") as EntityID,
  ProjectileLauncher: keccak256("block.ProjectileLauncher") as EntityID,
  HardenedDrill: keccak256("block.HardenedDrill") as EntityID,
  DenseMetalRefinery: keccak256("block.DenseMetalRefinery") as EntityID,
  AdvancedBatteryFactory: keccak256("block.AdvancedBatteryFactory") as EntityID,
  HighTempFoundry: keccak256("block.HighTempFoundry") as EntityID,
  PrecisionMachineryFactory: keccak256(
    "block.PrecisionMachineryFactory"
  ) as EntityID,
  IridiumDrillbitFactory: keccak256("block.IridiumDrillbitFactory") as EntityID,
  PrecisionPneumaticDrill: keccak256(
    "block.PrecisionPneumaticDrill"
  ) as EntityID,
  PenetratorFactory: keccak256("block.PenetratorFactory") as EntityID,
  PenetratingMissileFactory: keccak256(
    "block.PenetratingMissileFactory"
  ) as EntityID,
  MissileLaunchComplex: keccak256("block.MissileLaunchComplex") as EntityID,
  HighEnergyLaserFactory: keccak256("block.HighEnergyLaserFactory") as EntityID,
  ThermobaricWarheadFactory: keccak256(
    "block.ThermobaricWarheadFactory"
  ) as EntityID,
  ThermobaricMissileFactory: keccak256(
    "block.ThermobaricMissileFactory"
  ) as EntityID,
  KimberliteCatalystFactory: keccak256(
    "block.KimberliteCatalystFactory"
  ) as EntityID,

  // Crafted Components

  IronPlateCrafted: keccak256("block.IronPlateCrafted") as EntityID,
  BasicPowerSourceCrafted: keccak256(
    "block.BasicPowerSourceCrafted"
  ) as EntityID,
  KineticMissileCrafted: keccak256("block.KineticMissileCrafted") as EntityID,
  RefinedOsmiumCrafted: keccak256("block.RefinedOsmiumCrafted") as EntityID,
  AdvancedPowerSourceCrafted: keccak256(
    "block.AdvancedPowerSourceCrafted"
  ) as EntityID,
  PenetratingWarheadCrafted: keccak256(
    "block.PenetratingWarheadCrafted"
  ) as EntityID,
  PenetratingMissileCrafted: keccak256(
    "block.PenetratingMissileCrafted"
  ) as EntityID,
  TungstenRodsCrafted: keccak256("block.TungstenRodsCrafted") as EntityID,
  IridiumCrystalCrafted: keccak256("block.IridiumCrystalCrafted") as EntityID,
  IridiumDrillbitCrafted: keccak256("block.IridiumDrillbitCrafted") as EntityID,
  LaserPowerSourceCrafted: keccak256(
    "block.LaserPowerSourceCrafted"
  ) as EntityID,
  ThermobaricWarheadCrafted: keccak256(
    "block.ThermobaricWarheadCrafted"
  ) as EntityID,
  ThermobaricMissileCrafted: keccak256(
    "block.ThermobaricMissileCrafted"
  ) as EntityID,
  KimberliteCrystalCatalystCrafted: keccak256(
    "block.KimberliteCrystalCatalystCrafted"
  ) as EntityID,

  // Research components
  MainBaseResearch: keccak256("research.MainBaseResearch") as EntityID,
  IronResearch: keccak256("research.IronResearch") as EntityID,
  BasicMinerResearch: keccak256("research.BasicMinerResearch") as EntityID,
  ConveyorResearch: keccak256("research.ConveyorResearch") as EntityID,
  NodeResearch: keccak256("research.NodeResearch") as EntityID,
  CopperResearch: keccak256("research.CopperResearch") as EntityID,
  LithiumResearch: keccak256("research.LithiumResearch") as EntityID,
  TitaniumResearch: keccak256("research.TitaniumResearch") as EntityID,
  OsmiumResearch: keccak256("research.OsmiumResearch") as EntityID,
  TungstenResearch: keccak256("research.TungstenResearch") as EntityID,
  IridiumResearch: keccak256("research.IridiumResearch") as EntityID,
  KimberliteResearch: keccak256("research.KimberliteResearch") as EntityID,
  PlatingFactoryResearch: keccak256(
    "research.PlatingFactoryResearch"
  ) as EntityID,
  BasicBatteryFactoryResearch: keccak256(
    "research.BasicBatteryFactoryResearch"
  ) as EntityID,
  KineticMissileFactoryResearch: keccak256(
    "research.KineticMissileFactoryResearch"
  ) as EntityID,
  ProjectileLauncherResearch: keccak256(
    "research.ProjectileLauncherResearch"
  ) as EntityID,
  HardenedDrillResearch: keccak256(
    "research.HardenedDrillResearch"
  ) as EntityID,
  DenseMetalRefineryResearch: keccak256(
    "research.DenseMetalRefineryResearch"
  ) as EntityID,
  AdvancedBatteryFactoryResearch: keccak256(
    "research.AdvancedBatteryFactoryResearch"
  ) as EntityID,
  HighTempFoundryResearch: keccak256(
    "research.HighTempFoundryResearch"
  ) as EntityID,
  PrecisionMachineryFactoryResearch: keccak256(
    "research.PrecisionMachineryFactoryResearch"
  ) as EntityID,
  IridiumDrillbitFactoryResearch: keccak256(
    "research.IridiumDrillbitFactoryResearch"
  ) as EntityID,
  PrecisionPneumaticDrillResearch: keccak256(
    "research.PrecisionPneumaticDrillResearch"
  ) as EntityID,
  PenetratorFactoryResearch: keccak256(
    "research.PenetratorFactoryResearch"
  ) as EntityID,
  PenetratingMissileFactoryResearch: keccak256(
    "research.PenetratingMissileFactoryResearch"
  ) as EntityID,
  MissileLaunchComplexResearch: keccak256(
    "research.MissileLaunchComplexResearch"
  ) as EntityID,
  HighEnergyLaserFactoryResearch: keccak256(
    "research.HighEnergyLaserFactoryResearch"
  ) as EntityID,
  ThermobaricWarheadFactoryResearch: keccak256(
    "research.ThermobaricWarheadFactoryResearch"
  ) as EntityID,
  ThermobaricMissileFactoryResearch: keccak256(
    "research.ThermobaricMissileFactoryResearch"
  ) as EntityID,
  KimberliteCatalystFactoryResearch: keccak256(
    "research.KimberliteCatalystFactoryResearch"
  ) as EntityID,
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

  // Factories
  [BlockType.BulletFactory, "#824947"],

  [BlockType.Silo, "#bebebe"],
]);

export const BackgroundImage = new Map<EntityID, string>([
  //landscape blocks
  [BlockType.Water, "/img/terrain/water.gif"],
  [BlockType.Sandstone, "/img/terrain/sandstone.png"],
  [BlockType.Biofilm, "/img/terrain/biofilm.png"],
  [BlockType.Alluvium, "/img/terrain/alluvium.png"],
  [BlockType.Regolith, "/img/terrain/regolith.png"],
  [BlockType.Bedrock, "/img/terrain/bedrock.png"],
  [BlockType.Air, "/img/terrain/air.png"],

  //metal ores
  [BlockType.Lithium, "/img/resource/lithium_ore_layer.png"],
  [BlockType.Iron, "/img/resource/iron_ore_layer.png"],
  [BlockType.Copper, "/img/resource/copper_ore_layer.png"],
  [BlockType.Titanium, "/img/resource/titanium_ore_layer.png"],
  [BlockType.Iridium, "/img/resource/iridium_ore_layer.png"],
  [BlockType.Osmium, "/img/resource/osmium_ore_layer.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_ore_layer.png"],

  //mineral ores
  [BlockType.Kimberlite, "/img/resource/kimberlite_ore_layer.png"],
  [BlockType.Uraninite, "/img/resource/uraninite_ore_layer.png"],
  [BlockType.Bolutite, "/img/resource/bolutite_ore_layer.png"],

  // debug buildings
  [BlockType.Miner, "/img/building/minerdrill.gif"],
  [BlockType.LithiumMiner, "/img/building/minerdrill.png"],
  [BlockType.MainBase, "/img/building/mainbase.gif"],
  [BlockType.Conveyer, "/img/building/node.gif"],
  [BlockType.BulletFactory, "/img/building/bulletfactory.png"],
  [BlockType.Silo, "/img/building/silo.png"],

  //actual buildings
  [BlockType.BasicMiner, "/img/building/minerdrill.gif"],
  [BlockType.Node, "/img/building/node.gif"],
  [BlockType.PlatingFactory, "/img/building/newplatingfactory.gif"],
  [BlockType.BasicBatteryFactory, "/img/building/newbasicbatteryfactory.gif"],
  [BlockType.KineticMissileFactory, "/img/building/minerdrill.gif"],
  [BlockType.ProjectileLauncher, "/img/building/minerdrill.gif"],
  [BlockType.HardenedDrill, "/img/building/hardeneddrill.gif"],
  [BlockType.DenseMetalRefinery, "/img/building/densemetalrefinery.gif"],
  [BlockType.AdvancedBatteryFactory, "/img/building/advancedbatteryfactory.gif"],
  [BlockType.HighTempFoundry, "/img/building/hightempfoundry.gif"],
  [BlockType.PrecisionMachineryFactory, "/img/building/precisionmachineryfactory.gif"],
  [BlockType.IridiumDrillbitFactory, "/img/building/iridiumdrillbitfactory.gif"],
  [BlockType.PrecisionPneumaticDrill, "/img/building/precisionpneumaticdrill.gif"],
  [BlockType.PenetratorFactory, "/img/building/minerdrill.gif"],
  [BlockType.PenetratingMissileFactory, "/img/building/minerdrill.gif"],
  [BlockType.MissileLaunchComplex, "/img/building/minerdrill.gif"],
  [BlockType.HighEnergyLaserFactory, "/img/building/laserfactory.gif"],
  [BlockType.ThermobaricWarheadFactory, "/img/building/minerdrill.gif"],
  [BlockType.ThermobaricMissileFactory, "/img/building/minerdrill.gif"],
  [BlockType.KimberliteCatalystFactory, "/img/building/kimberlitecatalyst.gif"],
]);

export type DisplayTile = {
  x: number;
  y: number;
};

export type DisplayKeyPair = {
  terrain: EntityID;
  resource: EntityID | null;
};
