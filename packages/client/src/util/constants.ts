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
  Conveyor: keccak256("block.Conveyor") as EntityID,
  Miner: keccak256("block.Miner") as EntityID,
  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,
  BulletFactory: keccak256("block.BulletFactory") as EntityID,
  Silo: keccak256("block.Silo") as EntityID,

  // Dummy blocks for Demolish
  DemolishBuilding: keccak256("demolish.Building") as EntityID,
  DemolishPath: keccak256("demolish.Path") as EntityID,

  // Dummy block for selecting tiles
  SelectPath: keccak256("select.path") as EntityID,
  SelectAttack: keccak256("select.attack") as EntityID,

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
  BulletCrafted: keccak256("item.BulletCrafted") as EntityID,

  IronPlateCrafted: keccak256("item.IronPlateCrafted") as EntityID,
  BasicPowerSourceCrafted: keccak256(
    "item.BasicPowerSourceCrafted"
  ) as EntityID,
  KineticMissileCrafted: keccak256("item.KineticMissileCrafted") as EntityID,
  RefinedOsmiumCrafted: keccak256("item.RefinedOsmiumCrafted") as EntityID,
  AdvancedPowerSourceCrafted: keccak256(
    "item.AdvancedPowerSourceCrafted"
  ) as EntityID,
  PenetratingWarheadCrafted: keccak256(
    "item.PenetratingWarheadCrafted"
  ) as EntityID,
  PenetratingMissileCrafted: keccak256(
    "item.PenetratingMissileCrafted"
  ) as EntityID,
  TungstenRodsCrafted: keccak256("item.TungstenRodsCrafted") as EntityID,
  IridiumCrystalCrafted: keccak256("item.IridiumCrystalCrafted") as EntityID,
  IridiumDrillbitCrafted: keccak256("item.IridiumDrillbitCrafted") as EntityID,
  LaserPowerSourceCrafted: keccak256(
    "item.LaserPowerSourceCrafted"
  ) as EntityID,
  ThermobaricWarheadCrafted: keccak256(
    "item.ThermobaricWarheadCrafted"
  ) as EntityID,
  ThermobaricMissileCrafted: keccak256(
    "item.ThermobaricMissileCrafted"
  ) as EntityID,
  KimberliteCrystalCatalystCrafted: keccak256(
    "item.KimberliteCrystalCatalystCrafted"
  ) as EntityID,

  // debug
  BulletFactoryResearch: keccak256(
    "research.BulletFactoryResearch"
  ) as EntityID,
  SiloResearch: keccak256("research.SiloResearch") as EntityID,

  // Research components
  MainBaseResearch: keccak256("research.MainBase") as EntityID,
  BasicMinerResearch: keccak256("research.BasicMiner") as EntityID,
  ConveyorResearch: keccak256("research.Conveyor") as EntityID,
  NodeResearch: keccak256("research.Node") as EntityID,
  // IronResearch: keccak256("research.Iron") as EntityID,

  // CopperResearch: keccak256("block.Copper") as EntityID,
  // LithiumResearch: keccak256("block.Lithium") as EntityID,
  // TitaniumResearch: keccak256("block.Titanium") as EntityID,
  // OsmiumResearch: keccak256("block.Osmium") as EntityID,
  // TungstenResearch: keccak256("block.Tungsten") as EntityID,
  // IridiumResearch: keccak256("block.Iridium") as EntityID,
  // KimberliteResearch: keccak256("block.Kimberlite") as EntityID,

  PlatingFactoryResearch: keccak256("research.PlatingFactory") as EntityID,
  BasicBatteryFactoryResearch: keccak256(
    "research.BasicBatteryFactory"
  ) as EntityID,
  KineticMissileFactoryResearch: keccak256(
    "research.KineticMissileFactory"
  ) as EntityID,
  ProjectileLauncherResearch: keccak256(
    "research.ProjectileLauncher"
  ) as EntityID,
  HardenedDrillResearch: keccak256("research.HardenedDrill") as EntityID,
  DenseMetalRefineryResearch: keccak256(
    "research.DenseMetalRefinery"
  ) as EntityID,
  AdvancedBatteryFactoryResearch: keccak256(
    "research.AdvancedBatteryFactory"
  ) as EntityID,
  HighTempFoundryResearch: keccak256("research.HighTempFoundry") as EntityID,
  PrecisionMachineryFactoryResearch: keccak256(
    "research.PrecisionMachineryFactory"
  ) as EntityID,
  IridiumDrillbitFactoryResearch: keccak256(
    "research.IridiumDrillbitFactory"
  ) as EntityID,
  PrecisionPneumaticDrillResearch: keccak256(
    "research.PrecisionPneumaticDrill"
  ) as EntityID,
  PenetratorFactoryResearch: keccak256(
    "research.PenetratorFactory"
  ) as EntityID,
  PenetratingMissileFactoryResearch: keccak256(
    "research.PenetratingMissileFactory"
  ) as EntityID,
  MissileLaunchComplexResearch: keccak256(
    "research.MissileLaunchComplex"
  ) as EntityID,
  HighEnergyLaserFactoryResearch: keccak256(
    "research.HighEnergyLaserFactory"
  ) as EntityID,
  ThermobaricWarheadFactoryResearch: keccak256(
    "research.ThermobaricWarheadFactory"
  ) as EntityID,
  ThermobaricMissileFactoryResearch: keccak256(
    "research.ThermobaricMissileFactory"
  ) as EntityID,
  KimberliteCatalystFactoryResearch: keccak256(
    "research.KimberliteCatalystFactory"
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
  [BlockType.Conveyor, "#ffcd00"],

  // Debug factories
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
  [BlockType.Conveyor, "/img/building/conveyor.gif"],
  [BlockType.BulletFactory, "/img/building/bulletfactory.png"],
  [BlockType.Silo, "/img/building/silo.png"],

  //actual buildings
  [BlockType.BasicMiner, "/img/building/minerdrill.gif"],
  [BlockType.Node, "/img/building/node.gif"],
  [BlockType.PlatingFactory, "/img/building/newplatingfactory.gif"],
  [BlockType.BasicBatteryFactory, "/img/building/newbasicbatteryfactory.gif"],
  [BlockType.KineticMissileFactory, "/img/building/kineticmissilefactory.png"],
  [BlockType.ProjectileLauncher, "/img/building/projectilelauncher.png"],
  [BlockType.HardenedDrill, "/img/building/hardeneddrill.gif"],
  [BlockType.DenseMetalRefinery, "/img/building/densemetalrefinery.gif"],
  [
    BlockType.AdvancedBatteryFactory,
    "/img/building/advancedbatteryfactory.gif",
  ],
  [BlockType.HighTempFoundry, "/img/building/hightempfoundry.gif"],
  [
    BlockType.PrecisionMachineryFactory,
    "/img/building/precisionmachineryfactory.gif",
  ],
  [
    BlockType.IridiumDrillbitFactory,
    "/img/building/iridiumdrillbitfactory.gif",
  ],
  [
    BlockType.PrecisionPneumaticDrill,
    "/img/building/precisionpneumaticdrill.gif",
  ],
  [BlockType.PenetratorFactory, "/img/building/penetratorfactory.png"],
  [
    BlockType.PenetratingMissileFactory,
    "/img/building/penetratingmissilefactory.png",
  ],
  [BlockType.MissileLaunchComplex, "/img/building/missilelaunchcomplex.gif"],
  [BlockType.HighEnergyLaserFactory, "/img/building/laserfactory.gif"],
  [
    BlockType.ThermobaricWarheadFactory,
    "/img/building/thermobaricwarheadfactory.png",
  ],
  [
    BlockType.ThermobaricMissileFactory,
    "/img/building/thermobaricmissilefactory.png",
  ],
  [BlockType.KimberliteCatalystFactory, "/img/building/kimberlitecatalyst.gif"],

  // TODO: crafted items
]);

export const ResearchImage = new Map<EntityID, string>([
  [BlockType.MainBaseResearch, "/img/building/mainbase.gif"],
  [BlockType.BasicMinerResearch, "/img/building/minerdrill.gif"],
  [BlockType.ConveyorResearch, "/img/building/conveyor.gif"],
  [BlockType.NodeResearch, "/img/building/node.gif"],

  [BlockType.Iron, "/img/resource/iron_resource.png"],
  [BlockType.Copper, "/img/resource/copper_resource.png"],
  [BlockType.Lithium, "/img/resource/lithium_resource.png"],
  [BlockType.Titanium, "/img/resource/titanium_resource.png"],
  [BlockType.Osmium, "/img/resource/osmium_resource.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_resource.png"],
  [BlockType.Iridium, "/img/resource/iridium_resource.png"],
  [BlockType.Kimberlite, "/img/resource/kimberlite_resource.png"],

  [BlockType.PlatingFactoryResearch, "/img/building/newplatingfactory.gif"],
  [
    BlockType.BasicBatteryFactoryResearch,
    "/img/building/newbasicbatteryfactory.gif",
  ],
  [
    BlockType.KineticMissileFactoryResearch,
    "/img/building/kineticmissilefactory.png",
  ],
  [
    BlockType.ProjectileLauncherResearch,
    "/img/building/projectilelauncher.png",
  ],
  [BlockType.HardenedDrillResearch, "/img/building/hardeneddrill.gif"],
  [
    BlockType.DenseMetalRefineryResearch,
    "/img/building/densemetalrefinery.gif",
  ],
  [
    BlockType.AdvancedBatteryFactoryResearch,
    "/img/building/advancedbatteryfactory.gif",
  ],
  [BlockType.HighTempFoundryResearch, "/img/building/hightempfoundry.gif"],
  [
    BlockType.PrecisionMachineryFactoryResearch,
    "/img/building/precisionmachineryfactory.gif",
  ],
  [
    BlockType.IridiumDrillbitFactoryResearch,
    "/img/building/iridiumdrillbitfactory.gif",
  ],
  [
    BlockType.PrecisionPneumaticDrillResearch,
    "/img/building/precisionpneumaticdrill.gif",
  ],
  [BlockType.PenetratorFactoryResearch, "/img/building/penetratorfactory.png"],
  [
    BlockType.PenetratingMissileFactoryResearch,
    "/img/building/penetratingmissilefactory.png",
  ],
  [
    BlockType.MissileLaunchComplexResearch,
    "/img/building/missilelaunchcomplex.gif",
  ],
  [BlockType.HighEnergyLaserFactoryResearch, "/img/building/laserfactory.gif"],
  [
    BlockType.ThermobaricWarheadFactoryResearch,
    "/img/building/thermobaricwarheadfactory.png",
  ],
  [
    BlockType.ThermobaricMissileFactoryResearch,
    "/img/building/thermobaricmissilefactory.png",
  ],
  [
    BlockType.KimberliteCatalystFactoryResearch,
    "/img/building/kimberlitecatalyst.gif",
  ],
]);
//images of resource items (think of them like minecraft entities)
export const ResourceImage = new Map<EntityID, string>([
  [BlockType.Iron, "/img/resource/iron_resource.png"],
  [BlockType.Copper, "/img/resource/copper_resource.png"],
  [BlockType.Lithium, "/img/resource/lithium_resource.png"],
  [BlockType.Titanium, "/img/resource/titanium_resource.png"],
  [BlockType.Osmium, "/img/resource/osmium_resource.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_resource.png"],
  [BlockType.Iridium, "/img/resource/iridium_resource.png"],
  [BlockType.Kimberlite, "/img/resource/kimberlite_resource.png"],
  [BlockType.Uraninite, "/img/resource/uraninite_resource.png"],
  [BlockType.Bolutite, "/img/resource/bolutite_resource.png"],
  [BlockType.BulletCrafted, "/img/crafted/ironplate.png"],
  [BlockType.IronPlateCrafted, "/img/crafted/ironplate.png"],
  [BlockType.BasicPowerSourceCrafted, "/img/crafted/basicbattery.png"],
  [BlockType.AdvancedPowerSourceCrafted, "/img/crafted/advancedbattery.png"],
  [BlockType.IridiumCrystalCrafted, "/img/crafted/iridiumcrystal.png"],
  [BlockType.IridiumDrillbitCrafted, "/img/crafted/iridiumdrillbit.png"],
  [BlockType.LaserPowerSourceCrafted, "/img/crafted/laserbattery.png"],
  [
    BlockType.KimberliteCrystalCatalystCrafted,
    "/img/crafted/kimberlitecrystal.png",
  ],
  [BlockType.RefinedOsmiumCrafted, "/img/crafted/refinedosmium.png"],
  [BlockType.TungstenRodsCrafted, "/img/crafted/tungstenrod.png"],
  [BlockType.KineticMissileCrafted, "/img/crafted/kineticmissile.png"],
  [BlockType.PenetratingWarheadCrafted, "/img/crafted/penetratingwarhead.png"],
  [BlockType.PenetratingMissileCrafted, "/img/crafted/penetratingmissile.png"],
  [BlockType.ThermobaricWarheadCrafted, "/img/crafted/thermobaricwarhead.png"],
  [BlockType.ThermobaricMissileCrafted, "/img/crafted/thermobaricmissile.png"],

  // debug
  [BlockType.BulletCrafted, "/img/crafted/bullet.png"],
]);

export type DisplayTile = {
  x: number;
  y: number;
};

export type DisplayKeyPair = {
  terrain: EntityID;
  resource: EntityID | null;
};

export const BuildingResearchRequirements = new Map<EntityID, EntityID[]>([
  [BlockType.MainBase, [BlockType.MainBaseResearch]],
  [BlockType.BasicMiner, [BlockType.BasicMinerResearch]],
  [BlockType.Node, [BlockType.NodeResearch]],
  [BlockType.Conveyor, [BlockType.ConveyorResearch]],

  [BlockType.Miner, [BlockType.BasicMinerResearch]],
  [BlockType.BulletFactory, [BlockType.BulletFactoryResearch]],
  [BlockType.Silo, [BlockType.SiloResearch]],

  [BlockType.PlatingFactory, [BlockType.PlatingFactoryResearch]],
  [BlockType.BasicBatteryFactory, [BlockType.BasicBatteryFactoryResearch]],
  [BlockType.KineticMissileFactory, [BlockType.KineticMissileFactoryResearch]],
  [BlockType.ProjectileLauncher, [BlockType.ProjectileLauncherResearch]],
  [BlockType.HardenedDrill, [BlockType.HardenedDrillResearch]],
  [BlockType.DenseMetalRefinery, [BlockType.DenseMetalRefineryResearch]],
  [
    BlockType.AdvancedBatteryFactory,
    [BlockType.AdvancedBatteryFactoryResearch],
  ],
  [BlockType.HighTempFoundry, [BlockType.HighTempFoundryResearch]],
  [
    BlockType.PrecisionMachineryFactory,
    [BlockType.PrecisionMachineryFactoryResearch],
  ],
  [
    BlockType.IridiumDrillbitFactory,
    [BlockType.IridiumDrillbitFactoryResearch],
  ],
  [
    BlockType.PrecisionPneumaticDrill,
    [BlockType.PrecisionPneumaticDrillResearch],
  ],
  [BlockType.PenetratorFactory, [BlockType.PenetratorFactoryResearch]],
  [
    BlockType.PenetratingMissileFactory,
    [BlockType.PenetratingMissileFactoryResearch],
  ],
  [BlockType.MissileLaunchComplex, [BlockType.MissileLaunchComplexResearch]],
  [
    BlockType.HighEnergyLaserFactory,
    [BlockType.HighEnergyLaserFactoryResearch],
  ],
  [
    BlockType.ThermobaricWarheadFactory,
    [BlockType.ThermobaricWarheadFactoryResearch],
  ],
  [
    BlockType.ThermobaricMissileFactory,
    [BlockType.ThermobaricMissileFactoryResearch],
  ],
  [
    BlockType.KimberliteCatalystFactory,
    [BlockType.KimberliteCatalystFactoryResearch],
  ],
]);

export const BuildingResearchRequirementsDefaultUnlocked = new Set<EntityID>([
  BlockType.MainBaseResearch,
  BlockType.Iron,
  BlockType.BasicMinerResearch,
  BlockType.NodeResearch,

  // debug
  BlockType.ConveyorResearch,
  BlockType.BulletFactoryResearch,
  BlockType.SiloResearch,
]);
