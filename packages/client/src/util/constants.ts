import { EntityID } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { Key } from "engine/types";
import { hashStringEntity } from "./encode";
import { EMotherlodeSize, EMotherlodeType } from "src/util/web3/types";

export enum Action {
  DemolishBuilding,
  SelectBuilding,
  PlaceBuilding,
}

export const RESOURCE_SCALE = 1 / 100;

export const BlockType = {
  // Landscape blocks
  Sandstone: keccak256("block.Sandstone") as EntityID,
  Biofilm: keccak256("block.Biofilm") as EntityID,
  Alluvium: keccak256("block.Alluvium") as EntityID,
  Regolith: keccak256("block.Regolith") as EntityID,
  Bedrock: keccak256("block.Bedrock") as EntityID,
  Air: keccak256("block.Air") as EntityID,

  // Ores
  Water: keccak256("block.Water") as EntityID,
  Lithium: keccak256("block.Lithium") as EntityID,
  Iron: keccak256("block.Iron") as EntityID,
  Copper: keccak256("block.Copper") as EntityID,
  Titanium: keccak256("block.Titanium") as EntityID,
  Iridium: keccak256("block.Iridium") as EntityID,
  Sulfur: keccak256("block.Sulfur") as EntityID,
  Osmium: keccak256("block.Osmium") as EntityID,
  Tungsten: keccak256("block.Tungsten") as EntityID,
  Kimberlite: keccak256("block.Kimberlite") as EntityID,
  Uraninite: keccak256("block.Uraninite") as EntityID,
  Bolutite: keccak256("block.Bolutite") as EntityID,
  Platinum: keccak256("block.Platinum") as EntityID,

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

  // debug units
  DebugUnit: keccak256("block.DebugUnit") as EntityID,
  DebugUnit2: keccak256("block.DebugUnit2") as EntityID,
  DebugUnit3: keccak256("block.DebugUnit3") as EntityID,

  DebugUnitMiner: keccak256("unit.DebugUnitMiner") as EntityID,
  DebugUnitMiner2: keccak256("unit.DebugUnitMiner2") as EntityID,

  DebugUnitBattle1: keccak256("unit.DebugUnitBattle1") as EntityID,
  DebugUnitBattle2: keccak256("unit.DebugUnitBattle2") as EntityID,

  MainBase: keccak256("block.MainBase") as EntityID,
  DebugNode: keccak256("block.DebugNode") as EntityID,
  Miner: keccak256("block.Miner") as EntityID,
  LithiumMiner: keccak256("block.LithiumMiner") as EntityID,
  BulletFactory: keccak256("block.BulletFactory") as EntityID,
  Silo: keccak256("block.Silo") as EntityID,

  // Basic Buildings
  IronMine: keccak256("block.IronMine") as EntityID,
  CopperMine: keccak256("block.CopperMine") as EntityID,
  LithiumMine: keccak256("block.LithiumMine") as EntityID,
  SulfurMine: keccak256("block.SulfurMine") as EntityID,
  StorageUnit: keccak256("block.StorageUnit") as EntityID,

  //Advanced Buildings
  IronPlateFactory: keccak256("block.IronPlateFactory") as EntityID,
  PhotovoltaicCellFactory: keccak256(
    "block.PhotovoltaicCellFactory"
  ) as EntityID,
  AlloyFactory: keccak256("block.AlloyFactory") as EntityID,
  SolarPanel: keccak256("block.SolarPanel") as EntityID,
  Hangar: keccak256("block.Hangar") as EntityID,
  DroneFactory: keccak256("block.DroneFactory") as EntityID,
  StarmapperStation: keccak256("block.Starmapper") as EntityID,

  Alloy: keccak256("item.AlloyCrafted") as EntityID,
  PhotovoltaicCell: keccak256("item.PhotovoltaicCellCrafted") as EntityID,

  SpaceFuelCraftedItem: keccak256("item.SpaceFuelCrafted") as EntityID,
  ElectricityUtilityResource: keccak256(
    "item.ElectricityUtilityResource"
  ) as EntityID,
  HousingUtilityResource: keccak256("item.HousingUtilityResource") as EntityID,
  VesselUtilityResource: keccak256("item.VesselUtilityResource") as EntityID,

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

  ExpansionResearch1: hashStringEntity("research.Expansion", 1),
  ExpansionResearch2: hashStringEntity("research.Expansion", 2),
  ExpansionResearch3: hashStringEntity("research.Expansion", 3),
  ExpansionResearch4: hashStringEntity("research.Expansion", 4),
  ExpansionResearch5: hashStringEntity("research.Expansion", 5),
  ExpansionResearch6: hashStringEntity("research.Expansion", 6),
  ExpansionResearch7: hashStringEntity("research.Expansion", 7),

  AnvilDroneUpgrade1: hashStringEntity("research.AnvilDroneUpgrade", 1),
  AnvilDroneUpgrade2: hashStringEntity("research.AnvilDroneUpgrade", 2),
  AnvilDroneUpgrade3: hashStringEntity("research.AnvilDroneUpgrade", 3),
  AnvilDroneUpgrade4: hashStringEntity("research.AnvilDroneUpgrade", 4),
  AnvilDroneUpgrade5: hashStringEntity("research.AnvilDroneUpgrade", 5),

  HammerDroneUpgrade1: hashStringEntity("research.HammerDroneUpgrade", 1),
  HammerDroneUpgrade2: hashStringEntity("research.HammerDroneUpgrade", 2),
  HammerDroneUpgrade3: hashStringEntity("research.HammerDroneUpgrade", 3),
  HammerDroneUpgrade4: hashStringEntity("research.HammerDroneUpgrade", 4),
  HammerDroneUpgrade5: hashStringEntity("research.HammerDroneUpgrade", 5),

  AegisDroneUpgrade1: hashStringEntity("research.AegisDroneUpgrade", 1),
  AegisDroneUpgrade2: hashStringEntity("research.AegisDroneUpgrade", 2),
  AegisDroneUpgrade3: hashStringEntity("research.AegisDroneUpgrade", 3),
  AegisDroneUpgrade4: hashStringEntity("research.AegisDroneUpgrade", 4),
  AegisDroneUpgrade5: hashStringEntity("research.AegisDroneUpgrade", 5),

  StingerDroneUpgrade1: hashStringEntity("research.StingerDroneUpgrade", 1),
  StingerDroneUpgrade2: hashStringEntity("research.StingerDroneUpgrade", 2),
  StingerDroneUpgrade3: hashStringEntity("research.StingerDroneUpgrade", 3),
  StingerDroneUpgrade4: hashStringEntity("research.StingerDroneUpgrade", 4),
  StingerDroneUpgrade5: hashStringEntity("research.StingerDroneUpgrade", 5),

  MiningVesselUpgrade1: hashStringEntity("research.MiningVesselUpgrade", 1),
  MiningVesselUpgrade2: hashStringEntity("research.MiningVesselUpgrade", 2),
  MiningVesselUpgrade3: hashStringEntity("research.MiningVesselUpgrade", 3),
  MiningVesselUpgrade4: hashStringEntity("research.MiningVesselUpgrade", 4),
  MiningVesselUpgrade5: hashStringEntity("research.MiningVesselUpgrade", 5),

  MiningResearch1: hashStringEntity("research.MiningResearch", 1),
  MiningResearch2: hashStringEntity("research.MiningResearch", 2),
  MiningResearch3: hashStringEntity("research.MiningResearch", 3),
  MiningResearch4: hashStringEntity("research.MiningResearch", 4),
  MiningResearch5: hashStringEntity("research.MiningResearch", 5),

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
    "research.PhotovoltaicCellFactory"
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
  HammerLightDrone: keccak256("unit.HammerDrone") as EntityID,
  StingerDrone: keccak256("unit.StingerDrone") as EntityID,
  AnvilLightDrone: keccak256("unit.AnvilDrone") as EntityID,
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
  [BlockType.Sulfur, ["/img/resource/sulfur_ore_layer.png"]],
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

  //buildings
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
  //new buildings
  [
    BlockType.CopperMine,
    [
      "/img/building/coppermine/copper-miner-level1.png",
      "/img/building/coppermine/copper-miner-level2.png",
      "/img/building/coppermine/copper-miner-level3.png",
    ],
  ],
  [
    BlockType.IronMine,
    [
      "/img/building/ironmine/iron-mine-level1.png",
      "/img/building/ironmine/iron-miner-level2.png",
      "/img/building/ironmine/iron-miner-level3.png",
    ],
  ],
  [
    BlockType.LithiumMine,
    [
      "/img/building/lithiummine/lithium-mine-level1.png",
      "/img/building/lithiummine/lithium-miner-level2.png",
      "/img/building/lithiummine/lithium-miner-level3.png",
    ],
  ],
  [
    BlockType.SulfurMine,
    [
      "/img/building/sulfurmine/sulfur-mine-level1.png",
      "/img/building/sulfurmine/sulfur-miner-level2.png",
      "/img/building/sulfurmine/sulfur-miner-level3.png",
    ],
  ],
  [
    BlockType.StorageUnit,
    [
      "/img/building/storageunit/storageunit-level1.png",
      "/img/building/storageunit/storageunit-level2.png",
      "/img/building/storageunit/storageunit-level3.png",
    ],
  ],
  [
    BlockType.IronPlateFactory,
    [
      "/img/building/ironplatingfactory/ironplatingfactory-level1.png",
      "/img/building/ironplatingfactory/ironplatingfactory-level2.png",
    ],
  ],
  [
    BlockType.AlloyFactory,
    ["/img/building/alloyfactory/alloyfactory-level1.png"],
  ],
  [
    BlockType.PhotovoltaicCellFactory,
    [
      "/img/building/photovoltaic-cell-factory/level1/Photovoltaic_Factory_LVL1_1.png",
      "/img/building/photovoltaic-cell-factory/level2/Photovoltaic_Factory_LVL2_1.png",
    ],
  ],
  [
    BlockType.SolarPanel,
    [
      "/img/building/solarpanels/solarpanel-level1.png",
      "/img/building/solarpanels/solarpanel-level2.png",
    ],
  ],
  [BlockType.Hangar, ["/img/building/hangar/level1/Hangar1.png"]],
  [
    BlockType.DroneFactory,
    ["/img/building/drone-factory/normal/Drone_Factory1.png"],
  ],
  [
    BlockType.StarmapperStation,
    ["/img/building/starmapper-station/level1/Starmapper1.png"],
  ],

  //units
  [BlockType.HammerLightDrone, ["/img/unit/hammerdrone.png"]],
  [BlockType.StingerDrone, ["/img/unit/stingerdrone.png"]],
  [BlockType.AnvilLightDrone, ["/img/unit/anvildrone.png"]],
  [BlockType.AegisDrone, ["/img/unit/aegisdrone.png"]],
  [BlockType.MiningVessel, ["/img/unit/miningvessel.png"]],

  // debug units
  [BlockType.DebugUnit, ["/img/unit/stingerdrone.png"]],
  [BlockType.DebugUnit2, ["/img/unit/anvildrone.png"]],
  [BlockType.DebugUnit3, ["/img/unit/aegisdrone.png"]],
  [BlockType.DebugUnitMiner, ["/img/unit/miningvessel.png"]],
  [BlockType.DebugUnitMiner2, ["/img/unit/miningvessel.png"]],
  [BlockType.DebugUnitBattle1, ["/img/unit/hammerdrone.png"]],
  [BlockType.DebugUnitBattle2, ["/img/unit/hammerdrone.png"]],
]);

export const ResearchImage = new Map<EntityID, string>([
  [BlockType.Iron, "/img/resource/iron_resource.png"],
  [BlockType.Copper, "/img/resource/copper_resource.png"],
  [BlockType.Lithium, "/img/resource/lithium_resource.png"],
  [BlockType.Sulfur, "/img/resource/sulfur_resource.png"],
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
  [BlockType.Sulfur, "/img/resource/sulfur_resource.png"],
  [BlockType.Osmium, "/img/resource/osmium_resource.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_resource.png"],
  [BlockType.Iridium, "/img/resource/iridium_resource.png"],
  [BlockType.Kimberlite, "/img/resource/kimberlite_resource.png"],
  [BlockType.Uraninite, "/img/resource/uraninite_resource.png"],
  [BlockType.Bolutite, "/img/resource/bolutite_resource.png"],
  [BlockType.BulletCrafted, "/img/crafted/ironplate.png"],
  [BlockType.Platinum, "/img/resource/platinum_resource.png"],

  [BlockType.IronPlateCrafted, "/img/crafted/ironplate.png"],
  [BlockType.BasicPowerSourceCrafted, "/img/crafted/basicbattery.png"],
  [BlockType.AdvancedPowerSourceCrafted, "/img/crafted/photovoltaiccell.png"],
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

  [BlockType.Alloy, "/img/resource/alloy_resource.png"],
  [BlockType.PhotovoltaicCell, "/img/resource/photovoltaiccell_resource.png"],
  [BlockType.SpaceFuelCraftedItem, "/img/crafted/refinedosmium.png"],
  [BlockType.ElectricityUtilityResource, "/img/crafted/thermobaricwarhead.png"],
  // todo: update this
  [BlockType.HousingUtilityResource, "/img/crafted/thermobaricwarhead.png"],

  // debug
  [BlockType.BulletCrafted, "/img/crafted/bullet.png"],
]);

export type DisplayKeyPair = {
  terrain: EntityID | null;
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

export const MotherlodeSizeNames: Record<number, string> = {
  [EMotherlodeSize.SMALL]: "small",
  [EMotherlodeSize.MEDIUM]: "medium",
  [EMotherlodeSize.LARGE]: "large",
};

// do the same for types
export const MotherlodeTypeNames: Record<number, string> = {
  [EMotherlodeType.TITANIUM]: "titanium",
  [EMotherlodeType.IRIDIUM]: "iridium",
  [EMotherlodeType.PLATINUM]: "platinum",
  [EMotherlodeType.KIMBERLITE]: "kimberlite",
};
