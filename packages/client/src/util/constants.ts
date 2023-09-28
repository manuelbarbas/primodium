import { EntityID } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { Key } from "engine/types";
import { hashStringEntity } from "./encode";
import {
  EMotherlodeSize,
  EMotherlodeType,
  ESpaceRockType,
} from "src/util/web3/types";

export enum Action {
  DemolishBuilding,
  SelectBuilding,
  PlaceBuilding,
}

export enum ResourceType {
  Resource,
  ResourceRate,
  Utility,
}

export enum RewardType {
  Resource,
  Unit,
}

export enum RequirementType {
  Resource,
  Utility,
  ResourceRate,
  MaxUtility,
  BuildingCount,
  Unit,
  Raid,
  MotherlodeMined,
  DestroyedUnit,
  HasBuilt,
  HasResearched,
  HasMainBaseLevel,
  HasDefeatedPirate,
}

export const SPEED_SCALE = 10000;
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
  Garage: keccak256("block.Garage") as EntityID,

  Workshop: keccak256("block.Workshop") as EntityID,
  DroneFactory: keccak256("block.DroneFactory") as EntityID,

  StarmapperStation: keccak256("block.Starmapper") as EntityID,
  SAMLauncher: keccak256("block.SAMMissiles") as EntityID,

  Alloy: keccak256("item.AlloyCrafted") as EntityID,
  PhotovoltaicCell: keccak256("item.PhotovoltaicCellCrafted") as EntityID,

  SpaceFuelCraftedItem: keccak256("item.SpaceFuelCrafted") as EntityID,

  Electricity: keccak256("item.ElectricityUtilityResource") as EntityID,
  Housing: keccak256("item.HousingUtilityResource") as EntityID,
  VesselCapacity: keccak256("item.VesselUtilityResource") as EntityID,
  FleetMoves: keccak256("block.MoveCount") as EntityID,

  BulletCrafted: keccak256("item.BulletCrafted") as EntityID,
  IronPlate: keccak256("item.IronPlateCrafted") as EntityID,
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

  MinutemanMarineUpgrade1: hashStringEntity(
    "research.MinutemanMarineUpgrade",
    1
  ),
  MinutemanMarineUpgrade2: hashStringEntity(
    "research.MinutemanMarineUpgrade",
    2
  ),
  MinutemanMarineUpgrade3: hashStringEntity(
    "research.MinutemanMarineUpgrade",
    3
  ),
  MinutemanMarineUpgrade4: hashStringEntity(
    "research.MinutemanMarineUpgrade",
    4
  ),
  MinutemanMarineUpgrade5: hashStringEntity(
    "research.MinutemanMarineUpgrade",
    5
  ),

  TridentMarineUpgrade1: hashStringEntity("research.TridentMarineUpgrade", 1),
  TridentMarineUpgrade2: hashStringEntity("research.TridentMarineUpgrade", 2),
  TridentMarineUpgrade3: hashStringEntity("research.TridentMarineUpgrade", 3),
  TridentMarineUpgrade4: hashStringEntity("research.TridentMarineUpgrade", 4),
  TridentMarineUpgrade5: hashStringEntity("research.TridentMarineUpgrade", 5),

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

  MinutemanMarine: keccak256("unit.MinutemanMarine") as EntityID,
  TridentMarine: keccak256("unit.TridentMarine") as EntityID,

  //Objectives
  DebugFreeObjectiveID: keccak256("block.DebugFreeObjective") as EntityID,
  DebugHavResourcesObjectiveID: keccak256(
    "block.DebugHavResourcesObjective"
  ) as EntityID,
  DebugHaveUnitsObjectiveID: keccak256(
    "block.DebugHaveUnitsObjective"
  ) as EntityID,
  DebugHaveMaxUtilityObjectiveID: keccak256(
    "block.DebugHaveMaxUtilityObjective"
  ) as EntityID,
  DebugCompletedPriorObjectiveID: keccak256(
    "block.DebugCompletedPriorObjective"
  ) as EntityID,
  DebugMainBaseLevelObjectiveID: keccak256(
    "block.DebugMainBaseLevelObjective"
  ) as EntityID,
  DebugTechnologyResearchedObjectiveID: keccak256(
    "block.DebugTechnologyResearchedObjective"
  ) as EntityID,
  DebugResourceProductionObjectiveID: keccak256(
    "block.DebugResourceProductionObjective"
  ) as EntityID,
  DebugBuiltBuildingTypeObjectiveID: keccak256(
    "block.DebugBuiltBuildingTypeObjective"
  ) as EntityID,
  DebugNumberOfBuiltBuildingTypeObjectiveID: keccak256(
    "block.DebugNumberOfBuiltBuildingTypeObjective"
  ) as EntityID,
  DebugRaidObjectiveID: keccak256("block.DebugRaidObjective") as EntityID,
  DebugMotherlodeMiningTitaniumObjectiveID: keccak256(
    "block.DebugMotherlodeMiningTitaniumObjective"
  ) as EntityID,
  DebugMotherlodeMiningPlatinumObjectiveID: keccak256(
    "block.DebugMotherlodeMiningPlatinumObjective"
  ) as EntityID,
  DebugMotherlodeMiningIridiumObjectiveID: keccak256(
    "block.DebugMotherlodeMiningIridiumObjective"
  ) as EntityID,
  DebugMotherlodeMiningKimberliteObjectiveID: keccak256(
    "block.DebugMotherlodeMiningKimberliteObjective"
  ) as EntityID,
  DebugDestroyedUnitsObjectiveID: keccak256(
    "block.DebugDestroyedUnitsObjective"
  ) as EntityID,
  DebugResourceRewardObjectiveID: keccak256(
    "block.DebugResourceRewardObjective"
  ) as EntityID,
  DebugUnitsRewardObjectiveID: keccak256(
    "block.DebugUnitsRewardObjectiveID"
  ) as EntityID,

  DebugSpawnPirateAsteroid: keccak256(
    "block.DebugSpawnPirateAsteroid"
  ) as EntityID,

  DebugSpawnPirateAsteroidObjective: keccak256(
    "block.DebugSpawnPirateAsteroidObjective"
  ) as EntityID,

  DebugDefeatedPirateAsteroidObjective: keccak256(
    "block.DebugDefeatedPirateAsteroidObjective"
  ) as EntityID,

  BuildFirstIronMine: keccak256("objective.BuildFirstIronMine") as EntityID,
  BuildFirstCopperMine: keccak256("objective.BuildFirstCopperMine") as EntityID,
  BuildFirstLithiumMine: keccak256(
    "objective.BuildFirstLithiumMine"
  ) as EntityID,
  BuildFirstSulfurMine: keccak256("objective.BuildFirstSulfurMine") as EntityID,

  BuildFirstIronPlateFactory: keccak256(
    "objective.BuildFirstIronPlateFactory"
  ) as EntityID,
  BuildFirstAlloyFactory: keccak256(
    "objective.BuildFirstAlloyFactory"
  ) as EntityID,
  BuildFirstPVCellFactory: keccak256(
    "objective.BuildFirstPVCellFactory"
  ) as EntityID,

  BuildGarage: keccak256("objective.BuildGarage") as EntityID,
  BuildDroneFactory: keccak256("objective.BuildDroneFactory") as EntityID,
  BuildSolarPanel: keccak256("objective.BuildSolarPanel") as EntityID,
  BuildWorkshop: keccak256("objective.BuildWorkshop") as EntityID,
  BuildHangar: keccak256("objective.BuildHangar") as EntityID,

  TrainMarineUnit: keccak256("objective.TrainMarineUnit") as EntityID,
  TrainMarineUnit2: keccak256("objective.TrainMarineUnit2") as EntityID,
  TrainMarineUnit3: keccak256("objective.TrainMarineUnit3") as EntityID,

  TrainAdvancedMarineUnit: keccak256(
    "objective.TrainAdvancedMarineUnit"
  ) as EntityID,
  TrainAdvancedMarineUnit2: keccak256(
    "objective.TrainAdvancedMarineUnit2"
  ) as EntityID,
  TrainAdvancedMarineUnit3: keccak256(
    "objective.TrainAdvancedMarineUnit3"
  ) as EntityID,

  TrainAnvilDrone: keccak256("objective.TrainAnvilDrone") as EntityID,
  TrainAnvilDrone2: keccak256("objective.TrainAnvilDrone2") as EntityID,
  TrainAnvilDrone3: keccak256("objective.TrainAnvilDrone3") as EntityID,

  DefeatFirstPirateBase: keccak256(
    "objective.DefeatFirstPirateBase"
  ) as EntityID,
  DefeatSecondPirateBase: keccak256(
    "objective.DefeatSecondPirateBase"
  ) as EntityID,
  DefeatThirdPirateBase: keccak256(
    "objective.DefeatThirdPirateBase"
  ) as EntityID,
  DefeatFourthPirateBase: keccak256(
    "objective.DefeatFourthPirateBase"
  ) as EntityID,
  DefeatFifthPirateBase: keccak256(
    "objective.DefeatFifthPirateBase"
  ) as EntityID,
  DefeatSixthPirateBase: keccak256(
    "objective.DefeatSixthPirateBase"
  ) as EntityID,
  DefeatSeventhPirateBase: keccak256(
    "objective.DefeatSeventhPirateBase"
  ) as EntityID,
  DefeatEighthPirateBase: keccak256(
    "objective.DefeatEighthPirateBase"
  ) as EntityID,
  DefeatNinthPirateBase: keccak256(
    "objective.DefeatNinthPirateBase"
  ) as EntityID,
  DefeatTenthPirateBase: keccak256(
    "objective.DefeatTenthPirateBase"
  ) as EntityID,
  DefeatEleventhPirateBase: keccak256(
    "objective.DefeatEleventhPirateBase"
  ) as EntityID,

  ExpandBase: keccak256("objective.ExpandBase") as EntityID,
  ExpandBase2: keccak256("objective.ExpandBase2") as EntityID,
  ExpandBase3: keccak256("objective.ExpandBase3") as EntityID,
  ExpandBase4: keccak256("objective.ExpandBase4") as EntityID,
  ExpandBase5: keccak256("objective.ExpandBase5") as EntityID,
  ExpandBase6: keccak256("objective.ExpandBase6") as EntityID,

  RaiseIronPlateProduction: keccak256(
    "objective.RaiseIronPlateProduction"
  ) as EntityID,

  MineTitanium1ID: keccak256("objective.MineTitanium1") as EntityID,
  MineTitanium2ID: keccak256("objective.MineTitanium2") as EntityID,
  MineTitanium3ID: keccak256("objective.MineTitanium3") as EntityID,

  MinePlatinum1ID: keccak256("objective.MinePlatinum1") as EntityID,
  MinePlatinum2ID: keccak256("objective.MinePlatinum2") as EntityID,
  MinePlatinum3ID: keccak256("objective.MinePlatinum3") as EntityID,

  MineIridium1ID: keccak256("objective.MineIridium1") as EntityID,
  MineIridium2ID: keccak256("objective.MineIridium2") as EntityID,
  MineIridium3ID: keccak256("objective.MineIridium3") as EntityID,

  MineKimberlite1ID: keccak256("objective.MineKimberlite1") as EntityID,
  MineKimberlite2ID: keccak256("objective.MineKimberlite2") as EntityID,
  MineKimberlite3ID: keccak256("objective.MineKimberlite3") as EntityID,

  TrainHammerDroneID: keccak256("objective.TrainHammerDrone") as EntityID,
  TrainHammerDrone2ID: keccak256("objective.TrainHammerDrone2") as EntityID,
  TrainHammerDrone3ID: keccak256("objective.TrainHammerDrone3") as EntityID,

  TrainAegisDroneID: keccak256("objective.TrainAegisDrone") as EntityID,
  TrainAegisDrone2ID: keccak256("objective.TrainAegisDrone2") as EntityID,
  TrainAegisDrone3ID: keccak256("objective.TrainAegisDrone3") as EntityID,

  TrainStingerDroneID: keccak256("objective.TrainStingerDrone") as EntityID,
  TrainStingerDrone2ID: keccak256("objective.TrainStingerDrone2") as EntityID,
  TrainStingerDrone3ID: keccak256("objective.TrainStingerDrone3") as EntityID,

  RaidRawResourcesID: keccak256("objective.RaidRawResources") as EntityID,
  RaidRawResources2ID: keccak256("objective.RaidRawResources2") as EntityID,
  RaidRawResources3ID: keccak256("objective.RaidRawResources3") as EntityID,

  RaidFactoryResourcesID: keccak256(
    "objective.RaidFactoryResources"
  ) as EntityID,
  RaidFactoryResources2ID: keccak256(
    "objective.RaidFactoryResources2"
  ) as EntityID,
  RaidFactoryResources3ID: keccak256(
    "objective.RaidFactoryResources3"
  ) as EntityID,

  RaidMotherlodeResourcesID: keccak256(
    "objective.RaidMotherlodeResources"
  ) as EntityID,
  RaidMotherlodeResources2ID: keccak256(
    "objective.RaidMotherlodeResources2"
  ) as EntityID,
  RaidMotherlodeResources3ID: keccak256(
    "objective.RaidMotherlodeResources3"
  ) as EntityID,

  DestroyEnemyUnitsID: keccak256("objective.DestroyEnemyUnits") as EntityID,
  DestroyEnemyUnits2ID: keccak256("objective.DestroyEnemyUnits2") as EntityID,
  DestroyEnemyUnits3ID: keccak256("objective.DestroyEnemyUnits3") as EntityID,
  DestroyEnemyUnits4ID: keccak256("objective.DestroyEnemyUnits4") as EntityID,
  DestroyEnemyUnits5ID: keccak256("objective.DestroyEnemyUnits5") as EntityID,

  UpgradeMainBaseID: keccak256("objective.UpgradeMainBase") as EntityID,
  CommissionMiningVesselID: keccak256(
    "objective.CommissionMiningVessel"
  ) as EntityID,

  BuildStarmapID: keccak256("objective.BuildStarmap") as EntityID,
  BuildSAMLauncherID: keccak256("objective.BuildSAMLauncher") as EntityID,

  //Starmap
  Asteroid: keccak256("spacerock.Asteroid") as EntityID,
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
      "/img/building/ironmine/iron-miner-level1.png",
      "/img/building/ironmine/iron-miner-level2.png",
      "/img/building/ironmine/iron-miner-level3.png",
    ],
  ],
  [
    BlockType.LithiumMine,
    ["/img/building/lithiummine/lithium-mine-level1.png"],
  ],
  [BlockType.SulfurMine, ["/img/building/sulfurmine/sulfur-mine-level1.png"]],
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
  [
    BlockType.Garage,
    ["/img/building/ironplatingfactory/ironplatingfactory-level1.png"],
  ],
  [BlockType.Hangar, ["/img/building/hangar/level1/Hangar1.png"]],
  [
    BlockType.Workshop,
    [
      "/img/building/photovoltaic-cell-factory/level1/Photovoltaic_Factory_LVL1_1.png",
    ],
  ],
  [
    BlockType.DroneFactory,
    ["/img/building/drone-factory/normal/Drone_Factory1.png"],
  ],
  [
    BlockType.StarmapperStation,
    ["/img/building/starmapper-station/level1/Starmapper1.png"],
  ],

  [
    BlockType.SAMLauncher,
    ["/img/building/drone-factory/normal/Drone_Factory1.png"],
  ],

  //units
  [BlockType.HammerLightDrone, ["/img/unit/hammerdrone.png"]],
  [BlockType.StingerDrone, ["/img/unit/stingerdrone.png"]],
  [BlockType.AnvilLightDrone, ["/img/unit/anvildrone.png"]],
  [BlockType.AegisDrone, ["/img/unit/aegisdrone.png"]],
  [BlockType.MiningVessel, ["/img/unit/miningvessel.png"]],

  [BlockType.MinutemanMarine, ["/img/unit/minutemen_marine.png"]],
  [BlockType.TridentMarine, ["/img/unit/trident_marine.png"]],

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

  [BlockType.ExpansionResearch1, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch2, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch3, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch4, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch5, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch6, "/img/icons/mainbaseicon.png"],
  [BlockType.ExpansionResearch7, "/img/icons/mainbaseicon.png"],

  [BlockType.AnvilDroneUpgrade1, "/img/unit/anvildrone.png"],
  [BlockType.AnvilDroneUpgrade2, "/img/unit/anvildrone.png"],
  [BlockType.AnvilDroneUpgrade3, "/img/unit/anvildrone.png"],
  [BlockType.AnvilDroneUpgrade4, "/img/unit/anvildrone.png"],
  [BlockType.AnvilDroneUpgrade5, "/img/unit/anvildrone.png"],

  [BlockType.HammerDroneUpgrade1, "/img/unit/hammerdrone.png"],
  [BlockType.HammerDroneUpgrade2, "/img/unit/hammerdrone.png"],
  [BlockType.HammerDroneUpgrade3, "/img/unit/hammerdrone.png"],
  [BlockType.HammerDroneUpgrade4, "/img/unit/hammerdrone.png"],
  [BlockType.HammerDroneUpgrade5, "/img/unit/hammerdrone.png"],

  [BlockType.AegisDroneUpgrade1, "/img/unit/aegisdrone.png"],
  [BlockType.AegisDroneUpgrade2, "/img/unit/aegisdrone.png"],
  [BlockType.AegisDroneUpgrade3, "/img/unit/aegisdrone.png"],
  [BlockType.AegisDroneUpgrade4, "/img/unit/aegisdrone.png"],
  [BlockType.AegisDroneUpgrade5, "/img/unit/aegisdrone.png"],

  [BlockType.StingerDroneUpgrade1, "/img/unit/stingerdrone.png"],
  [BlockType.StingerDroneUpgrade2, "/img/unit/stingerdrone.png"],
  [BlockType.StingerDroneUpgrade3, "/img/unit/stingerdrone.png"],
  [BlockType.StingerDroneUpgrade4, "/img/unit/stingerdrone.png"],
  [BlockType.StingerDroneUpgrade5, "/img/unit/stingerdrone.png"],

  [BlockType.MiningResearch1, "/img/unit/miningvessel.png"],
  [BlockType.MiningResearch2, "/img/unit/miningvessel.png"],
  [BlockType.MiningResearch3, "/img/unit/miningvessel.png"],
  [BlockType.MiningResearch4, "/img/unit/miningvessel.png"],
  [BlockType.MiningResearch5, "/img/unit/miningvessel.png"],

  [BlockType.MiningVesselUpgrade1, "/img/unit/miningvessel.png"],
  [BlockType.MiningVesselUpgrade2, "/img/unit/miningvessel.png"],
  [BlockType.MiningVesselUpgrade3, "/img/unit/miningvessel.png"],
  [BlockType.MiningVesselUpgrade4, "/img/unit/miningvessel.png"],
  [BlockType.MiningVesselUpgrade5, "/img/unit/miningvessel.png"],

  [BlockType.TridentMarineUpgrade1, "/img/unit/anvildrone.png"],
  [BlockType.TridentMarineUpgrade2, "/img/unit/anvildrone.png"],
  [BlockType.TridentMarineUpgrade3, "/img/unit/anvildrone.png"],
  [BlockType.TridentMarineUpgrade4, "/img/unit/anvildrone.png"],
  [BlockType.TridentMarineUpgrade5, "/img/unit/anvildrone.png"],

  [BlockType.MinutemanMarineUpgrade1, "/img/unit/anvildrone.png"],
  [BlockType.MinutemanMarineUpgrade2, "/img/unit/anvildrone.png"],
  [BlockType.MinutemanMarineUpgrade3, "/img/unit/anvildrone.png"],
  [BlockType.MinutemanMarineUpgrade4, "/img/unit/anvildrone.png"],
  [BlockType.MinutemanMarineUpgrade5, "/img/unit/anvildrone.png"],
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

  [BlockType.IronPlate, "/img/crafted/ironplate.png"],
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

  [BlockType.Electricity, "/img/icons/powericon.png"],
  [BlockType.Housing, "/img/icons/utilitiesicon.png"],
  [BlockType.VesselCapacity, "/img/unit/miningvessel.png"],
  [BlockType.FleetMoves, "img/icons/moveicon.png"],

  // debug
  [BlockType.BulletCrafted, "/img/crafted/bullet.png"],

  //units
  [BlockType.HammerLightDrone, "/img/unit/hammerdrone.png"],
  [BlockType.StingerDrone, "/img/unit/stingerdrone.png"],
  [BlockType.AnvilLightDrone, "/img/unit/anvildrone.png"],
  [BlockType.AegisDrone, "/img/unit/aegisdrone.png"],
  [BlockType.MiningVessel, "/img/unit/miningvessel.png"],
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
  [EMotherlodeSize.SMALL]: "Small",
  [EMotherlodeSize.MEDIUM]: "Medium",
  [EMotherlodeSize.LARGE]: "Large",
};

// do the same for types
export const MotherlodeTypeNames: Record<number, string> = {
  [EMotherlodeType.TITANIUM]: "Titanium",
  [EMotherlodeType.IRIDIUM]: "Iridium",
  [EMotherlodeType.PLATINUM]: "Platinum",
  [EMotherlodeType.KIMBERLITE]: "Kimberlite",
};

export const SpaceRockTypeNames: Record<number, string> = {
  [ESpaceRockType.Asteroid]: "Asteroid",
  [ESpaceRockType.Motherlode]: "Motherlode",
};

export const ResourceStorages = [
  BlockType.Iron,
  BlockType.Copper,
  BlockType.Lithium,
  BlockType.IronPlate,
  BlockType.Alloy,
  BlockType.PhotovoltaicCell,
  BlockType.Sulfur,
  BlockType.Titanium,
  BlockType.Iridium,
  BlockType.Platinum,
  BlockType.Kimberlite,
];

export const UtilityStorages = [
  BlockType.Housing,
  BlockType.Electricity,
  BlockType.VesselCapacity,
  BlockType.FleetMoves,
];
