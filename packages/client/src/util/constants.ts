import { EntityID } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { Key } from "engine/types";

export enum Action {
  DemolishBuilding,
  DemolishPath,
  SelectPath,
  SelectBuilding,
  Conveyor,
  PlaceBuilding,
}

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
  DebugIronMine: keccak256("block.DebugIronMine") as EntityID,
  DebugIronMineNoTileReqID: keccak256(
    "block.DebugIronMineNoTileReq"
  ) as EntityID,
  DebugCopperMine: keccak256("block.DebugCopperMine") as EntityID,
  DebugLithiumMine: keccak256("block.DebugLithiumMine") as EntityID,

  DebugIronPlateFactory: keccak256("block.DebugIronPlateFactory") as EntityID,
  DebugAlloyFactory: keccak256("block.DebugAlloyFactory") as EntityID,
  DebugLithiumCopperOxideFactory: keccak256(
    "block.DebugLithiumCopperOxideFactory"
  ) as EntityID,
  DebugSolarPanel: keccak256("block.DebugSolarPanel") as EntityID,
  DebugStorageBuilding: keccak256("block.DebugStorageBuilding") as EntityID,
  DebugDemolishBuilding: keccak256("block.DebugDemolishBuilding") as EntityID,
  DebugDemolishPath: keccak256("block.DebugDemolishPath") as EntityID,

  MainBase: keccak256("block.MainBase") as EntityID,
  DebugNode: keccak256("block.DebugNode") as EntityID,
  Miner: keccak256("block.Miner") as EntityID,
  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,
  BulletFactory: keccak256("block.BulletFactory") as EntityID,
  Silo: keccak256("block.Silo") as EntityID,

  // Dummy block for Conveyor between tiles
  Conveyor: keccak256("block.Conveyor") as EntityID,

  // New Buildings
  IronMine: keccak256("block.IronMine") as EntityID,
  CopperMine: keccak256("block.CopperMine") as EntityID,
  LithiumMine: keccak256("block.LithiumMine") as EntityID,
  SulfurMine: keccak256("block.SulfurMine") as EntityID,
  StorageUnit: keccak256("block.StorageUnit") as EntityID,
  IronPlateFactory: keccak256("block.IronPlateFactory") as EntityID,
  PhotovoltaicCellFactory: keccak256(
    "block.LithiumCopperOxideFactory"
  ) as EntityID,
  SpaceFuelFactory: keccak256("block.SpaceFuelFactory") as EntityID,
  DroneFactory: keccak256("block.DroneFactory") as EntityID,
  PropulsionFuelFactory: keccak256("block.PropulsionFuelFactory") as EntityID,
  AlloyFactory: keccak256("block.AlloyFactory") as EntityID,
  SolarPanel: keccak256("block.SolarPanel") as EntityID,
  HousingUnit: keccak256("block.HousingUnit") as EntityID,

  // Old Buildings
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

  AlloyCraftedItem: keccak256("item.AlloyCrafted") as EntityID,
  LithiumCopperOxideCraftedItem: keccak256(
    "item.LithiumCopperOxideCrafted"
  ) as EntityID,
  SpaceFuelCraftedItem: keccak256("item.SpaceFuelCrafted") as EntityID,
  ElectricityUtilityResource: keccak256(
    "item.ElectricityUtilityResource"
  ) as EntityID,

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

  IronMine2Research: keccak256("research.IronMine2") as EntityID,
  IronMine3Research: keccak256("research.IronMine3") as EntityID,
  IronMine4Research: keccak256("research.IronMine4") as EntityID,

  CopperMineResearch: keccak256("research.CopperMine") as EntityID,
  CopperMine2Research: keccak256("research.CopperMine2") as EntityID,
  CopperMine3Research: keccak256("research.CopperMine3") as EntityID,

  StorageUnitResearch: keccak256("research.StorageUnit") as EntityID,
  StorageUnit2Research: keccak256("research.StorageUnit2") as EntityID,
  StorageUnit3Research: keccak256("research.StorageUnit3") as EntityID,

  IronPlateFactoryResearch: keccak256("research.IronPlateFactory") as EntityID,
  IronPlateFactory2Research: keccak256(
    "research.IronPlateFactory2"
  ) as EntityID,
  IronPlateFactory3Research: keccak256(
    "research.IronPlateFactory3"
  ) as EntityID,
  IronPlateFactory4Research: keccak256(
    "research.IronPlateFactory4"
  ) as EntityID,

  LithiumMineResearch: keccak256("research.LithiumMine") as EntityID,
  LithiumMine2Research: keccak256("research.LithiumMine2") as EntityID,
  LithiumMine3Research: keccak256("research.LithiumMine3") as EntityID,

  AlloyFactoryResearch: keccak256("research.AlloyFactory") as EntityID,
  AlloyFactory2Research: keccak256("research.AlloyFactory2") as EntityID,
  AlloyFactory3Research: keccak256("research.AlloyFactory3") as EntityID,

  PhotovoltaicCellResearch: keccak256(
    "research.LithiumCopperOxideFactory"
  ) as EntityID,
  PhotovoltaicCell2Research: keccak256(
    "research.LithiumCopperOxideFactory2"
  ) as EntityID,
  PhotovoltaicCell3Research: keccak256(
    "research.LithiumCopperOxideFactory3"
  ) as EntityID,

  SpaceFuelFactoryResearch: keccak256("research.SpaceFuelFactory") as EntityID,
  SpaceFuelFactory2Research: keccak256(
    "research.SpaceFuelFactory2"
  ) as EntityID,
  SpaceFuelFactory3Research: keccak256(
    "research.SpaceFuelFactory3"
  ) as EntityID,

  SolarPanelResearch: keccak256("research.SolarPanel") as EntityID,
  SolarPanel2Research: keccak256("research.SolarPanel2") as EntityID,
  SolarPanel3Research: keccak256("research.SolarPanel3") as EntityID,

  HousingUnitResearch: keccak256("research.HousingUnit") as EntityID,
  HousingUnit2Research: keccak256("research.HousingUnit2") as EntityID,
  HousingUnit3Research: keccak256("research.HousingUnit3") as EntityID,

  BuildingKey: "building" as EntityID,
  ArrowMarker: keccak256("marker.Arrow") as EntityID,

  // Units
  HammerLightDrone: keccak256("unit.HammerLightDrone") as EntityID,
  StingerDrone: keccak256("unit.StingerDrone") as EntityID,
  AnvilLightDrone: keccak256("unit.AnvilLightDrone") as EntityID,
  AegisDrone: keccak256("unit.AegisDrone") as EntityID,
  MiningVessel: keccak256("unit.MiningVessel") as EntityID,
};

export const BlockIdToKey = Object.entries(BlockType).reduce<{
  [key: EntityID]: string;
}>((acc, [key, id]) => {
  acc[id] = key;
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

  // Resource
  [BlockType.MainBase, "#8676c0"],
  [BlockType.Conveyor, "#ffcd00"],
]);

export const BackgroundImage = new Map<EntityID, string[]>([
  //landscape blocks
  [BlockType.Water, ["/img/terrain/water.gif"]],
  [BlockType.Sandstone, ["/img/terrain/sandstone.png"]],
  [BlockType.Biofilm, ["/img/terrain/biofilm.png"]],
  [BlockType.Alluvium, ["/img/terrain/alluvium.png"]],
  [BlockType.Regolith, ["/img/terrain/regolith.png"]],
  [BlockType.Bedrock, ["/img/terrain/bedrock.png"]],
  [BlockType.Air, ["/img/terrain/air.png"]],

  //metal ores
  [BlockType.Lithium, ["/img/resource/lithium_ore_layer.png"]],
  [BlockType.Iron, ["/img/resource/iron_ore_layer.png"]],
  [BlockType.Copper, ["/img/resource/copper_ore_layer.png"]],
  [BlockType.Titanium, ["/img/resource/titanium_ore_layer.png"]],
  [BlockType.Iridium, ["/img/resource/iridium_ore_layer.png"]],
  [BlockType.Osmium, ["/img/resource/osmium_ore_layer.png"]],
  [BlockType.Tungsten, ["/img/resource/tungsten_ore_layer.png"]],

  //mineral ores
  [BlockType.Kimberlite, ["/img/resource/kimberlite_ore_layer.png"]],
  [BlockType.Uraninite, ["/img/resource/uraninite_ore_layer.png"]],
  [BlockType.Bolutite, ["/img/resource/bolutite_ore_layer.png"]],

  // debug buildings
  [BlockType.DebugIronMine, ["/img/building/minerdrill.gif"]],
  [BlockType.DebugCopperMine, ["/img/building/minerdrill.gif"]],
  [BlockType.DebugLithiumMine, ["/img/building/minerdrill.gif"]],
  [BlockType.DebugIronPlateFactory, ["/img/building/newplatingfactory.gif"]],
  [BlockType.DebugAlloyFactory, ["/img/building/newplatingfactory.gif"]],
  [
    BlockType.DebugLithiumCopperOxideFactory,
    ["/img/building/newplatingfactory.gif"],
  ],
  [BlockType.DebugStorageBuilding, ["/img/building/node.gif"]],
  [BlockType.DebugSolarPanel, ["/img/building/node.gif"]],

  [
    BlockType.MainBase,
    [
      "/img/building/mainbase/mainbase.png",
      "/img/building/mainbase/mainbase-level2.png",
      "/img/building/mainbase/mainbase-level3.png",
      "/img/building/mainbase/mainbase-level4.png",
      "/img/building/mainbase/mainbase-level5.png",
    ],
  ],
  [BlockType.DebugNode, ["/img/building/node.gif"]],

  // dummy buildings
  [BlockType.Conveyor, ["/img/building/conveyor.gif"]],

  //new buildings
  [
    BlockType.CopperMine,
    [
      "/img/building/coppermine/copper-miner.gif",
      "/img/building/coppermine/copper-miner-level2.gif",
      "/img/building/coppermine/copper-miner-level3.png",
    ],
  ],
  [
    BlockType.IronMine,
    [
      "/img/building/ironmine/iron-miner.gif",
      "/img/building/ironmine/iron-miner-level2.gif",
      "/img/building/ironmine/iron-miner-level3.png",
    ],
  ],
  [
    BlockType.LithiumMine,
    [
      "/img/building/lithiummine/lithium-miner.gif",
      "/img/building/lithiummine/lithium-miner-level2.gif",
      "/img/building/lithiummine/lithium-miner-level3.png",
    ],
  ],
  [
    BlockType.SulfurMine,
    [
      "/img/building/sulfurmine/sulfur-miner.gif",
      "/img/building/sulfurmine/sulfur-miner-level2.gif",
      "/img/building/sulfurmine/sulfur-miner-level3.png",
    ],
  ],
  [
    BlockType.StorageUnit,
    [
      "/img/building/storageunit/storageunit-level1.png",
      "/img/building/storageunit/storageunit-level2.gif",
    ],
  ],
  [
    BlockType.IronPlateFactory,
    [
      "/img/building/ironplatingfactory/ironplatingfactory-level1.gif",
      "/img/building/ironplatingfactory/ironplatingfactory-level2.gif",
    ],
  ],
  [
    BlockType.AlloyFactory,
    ["/img/building/alloyfactory/alloyfactory-level1.gif"],
  ],
  [
    BlockType.PhotovoltaicCellFactory,
    [
      "/img/building/photovoltaiccell/photovoltaiccell-level1.gif",
      "/img/building/photovoltaiccell/photovoltaiccell-level2.gif",
    ],
  ],
  [
    BlockType.SolarPanel,
    [
      "/img/building/solarpanels/solarpanel-level1.png",
      "/img/building/solarpanels/solarpanel-level2.png",
    ],
  ],
  [BlockType.HousingUnit, ["/img/building/newplatingfactory.gif"]],
  [
    BlockType.PropulsionFuelFactory,
    ["/img/building/propulsionfuelfactory.gif"],
  ],
  [BlockType.SpaceFuelFactory, ["/img/building/newplatingfactory.gif"]],
]);

export const ResearchImage = new Map<EntityID, string>([
  [BlockType.Iron, "/img/resource/iron_resource.png"],
  [BlockType.Copper, "/img/resource/copper_resource.png"],
  [BlockType.Lithium, "/img/resource/lithium_resource.png"],
  [BlockType.Titanium, "/img/resource/titanium_resource.png"],
  [BlockType.Osmium, "/img/resource/osmium_resource.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_resource.png"],
  [BlockType.Iridium, "/img/resource/iridium_resource.png"],
  [BlockType.Kimberlite, "/img/resource/kimberlite_resource.png"],

  [BlockType.IronMine2Research, "/img/building/ironmine/iron-miner-level2.gif"],
  [BlockType.IronMine3Research, "/img/building/ironmine/iron-miner-level3.png"],
  [BlockType.IronMine4Research, "/img/building/ironmine/iron-miner-level3.png"],

  [BlockType.CopperMineResearch, "/img/building/coppermine/copper-miner.gif"],
  [
    BlockType.CopperMine2Research,
    "/img/building/coppermine/copper-miner-level2.gif",
  ],
  [
    BlockType.CopperMine3Research,
    "/img/building/coppermine/copper-miner-level3.png",
  ],

  [
    BlockType.StorageUnitResearch,
    "/img/building/storageunit/storageunit-level1.png",
  ],
  [
    BlockType.StorageUnit2Research,
    "/img/building/storageunit/storageunit-level2.gif",
  ],
  [
    BlockType.StorageUnit3Research,
    "/img/building/storageunit/storageunit-level2.gif",
  ],

  [
    BlockType.LithiumMineResearch,
    "/img/building/lithiummine/lithium-miner.gif",
  ],
  [
    BlockType.LithiumMine2Research,
    "/img/building/lithiummine/lithium-miner-level2.gif",
  ],
  [
    BlockType.LithiumMine3Research,
    "/img/building/lithiummine/lithium-miner-level3.png",
  ],

  [
    BlockType.IronPlateFactoryResearch,
    "/img/building/ironplatingfactory/ironplatingfactory-level1.gif",
  ],
  [
    BlockType.IronPlateFactory2Research,
    "/img/building/ironplatingfactory/ironplatingfactory-level2.gif",
  ],
  [
    BlockType.IronPlateFactory3Research,
    "/img/building/ironplatingfactory/ironplatingfactory-level2.gif",
  ],
  [
    BlockType.IronPlateFactory4Research,
    "/img/building/ironplatingfactory/ironplatingfactory-level2.gif",
  ],

  [
    BlockType.AlloyFactoryResearch,
    "/img/building/alloyfactory/alloyfactory-level1.gif",
  ],
  [
    BlockType.AlloyFactory2Research,
    "/img/building/alloyfactory/alloyfactory-level1.gif",
  ],
  [
    BlockType.AlloyFactory3Research,
    "/img/building/alloyfactory/alloyfactory-level1.gif",
  ],

  [
    BlockType.PhotovoltaicCellResearch,
    "/img/building/photovoltaiccell/photovoltaiccell-level1.gif",
  ],
  [
    BlockType.PhotovoltaicCell2Research,
    "/img/building/photovoltaiccell/photovoltaiccell-level2.gif",
  ],
  [
    BlockType.PhotovoltaicCell3Research,
    "/img/building/photovoltaiccell/photovoltaiccell-level2.gif",
  ],

  [BlockType.SpaceFuelFactoryResearch, "/img/building/spacefuel.gif"],
  [BlockType.SpaceFuelFactory2Research, "/img/building/spacefuel.gif"],
  [BlockType.SpaceFuelFactory3Research, "/img/building/spacefuel.gif"],

  [
    BlockType.SolarPanelResearch,
    "/img/building/solarpanels/solarpanel-level1.png",
  ],
  [
    BlockType.SolarPanel2Research,
    "/img/building/solarpanels/solarpanel-level2.png",
  ],
  [
    BlockType.SolarPanel2Research,
    "/img/building/solarpanels/solarpanel-level2.png",
  ],

  [BlockType.HousingUnitResearch, "/img/building/newplatingfactory.gif"],
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
    "/img/crafted/kimberlitecatalyst.png",
  ],
  [BlockType.RefinedOsmiumCrafted, "/img/crafted/refinedosmium.png"],
  [BlockType.TungstenRodsCrafted, "/img/crafted/tungstenrod.png"],
  [BlockType.KineticMissileCrafted, "/img/crafted/kineticmissile.png"],
  [BlockType.PenetratingWarheadCrafted, "/img/crafted/penetratingwarhead.png"],
  [BlockType.PenetratingMissileCrafted, "/img/crafted/penetratingmissile.png"],
  [BlockType.ThermobaricWarheadCrafted, "/img/crafted/thermobaricwarhead.png"],
  [BlockType.ThermobaricMissileCrafted, "/img/crafted/thermobaricmissile.png"],

  [BlockType.AlloyCraftedItem, "/img/crafted/iridiumdrillbit.png"],
  [BlockType.LithiumCopperOxideCraftedItem, "/img/crafted/advancedbattery.png"],
  [BlockType.SpaceFuelCraftedItem, "/img/crafted/refinedosmium.png"],
  [BlockType.ElectricityUtilityResource, "/img/crafted/thermobaricwarhead.png"],

  // debug
  [BlockType.BulletCrafted, "/img/crafted/bullet.png"],
]);

export type DisplayKeyPair = {
  terrain: EntityID;
  resource: EntityID | null;
};

export const KeyImages = new Map<Key, string>([
  ["ONE", "/img/keys/one.png"],
  ["TWO", "/img/keys/two.png"],
  ["THREE", "/img/keys/three.png"],
  ["FOUR", "/img/keys/four.png"],
  ["FIVE", "/img/keys/five.png"],
  ["SIX", "/img/keys/six.png"],
  ["SEVEN", "/img/keys/seven.png"],
  ["EIGHT", "/img/keys/eight.png"],
  ["NINE", "/img/keys/nine.png"],
  ["ZERO", "/img/keys/zero.png"],
  ["Q", "/img/keys/q.png"],
  ["E", "/img/keys/e.png"],
]);
