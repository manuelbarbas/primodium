import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { MUDEnums } from "contracts/config/enums";
import { Key } from "engine/types";
import { EMotherlodeType, ERock, ESize } from "src/util/web3/types";
import { toHex } from "viem";

export const toHex32 = (input: string) => toHex(input, { size: 32 });
export const encodeEntityLevel = (entity: string, level: number) => {
  return encodeEntity({ entity: "bytes32", level: "uint256" }, { entity: toHex32(entity), level: BigInt(level) });
};

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

export const SPEED_SCALE = BigInt(10000);
export const RESOURCE_SCALE = BigInt(100);
export const PIRATE_KEY = "pirate";

export const EResource = MUDEnums.EResource as Entity[];

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

export const key = {
  BuildingTileKey: toHex32("building:tile"),
  ExpansionKey: toHex32("Expansion"),
  BuildingKey: toHex32("Building"),
  UnitKey: toHex32("Unit"),
};

export const BlockType = {
  // Landscape blocks
  Sandstone: "Sandstone" as Entity,
  Biofilm: "Biofilm" as Entity,
  Alluvium: "Alluvium" as Entity,
  Regolith: "Regolith" as Entity,
  Bedrock: "Bedrock" as Entity,
  Air: "Air" as Entity,

  // Ores
  Water: "Water" as Entity,
  Lithium: "Lithium" as Entity,
  Iron: "Iron" as Entity,
  Copper: "Copper" as Entity,
  Titanium: "Titanium" as Entity,
  Iridium: "Iridium" as Entity,
  Sulfur: "Sulfur" as Entity,
  Osmium: "Osmium" as Entity,
  Tungsten: "Tungsten" as Entity,
  Kimberlite: "Kimberlite" as Entity,
  Uraninite: "Uraninite" as Entity,
  Bolutite: "Bolutite" as Entity,
  Platinum: "Platinum" as Entity,

  MainBase: toHex32("MainBase") as Entity,
  DebugNode: toHex32("DebugNode") as Entity,
  Miner: toHex32("Miner") as Entity,
  LithiumMiner: toHex32("LithiumMiner") as Entity,
  BulletFactory: toHex32("BulletFactory") as Entity,
  Silo: toHex32("Silo") as Entity,

  // Basic Buildings
  IronMine: toHex32("IronMine") as Entity,
  CopperMine: toHex32("CopperMine") as Entity,
  LithiumMine: toHex32("LithiumMine") as Entity,
  SulfurMine: toHex32("SulfurMine") as Entity,
  StorageUnit: toHex32("StorageUnit") as Entity,

  //Advanced Buildings
  IronPlateFactory: toHex32("IronPlateFactory") as Entity,
  PVCellFactory: toHex32("PVCellFactory") as Entity,
  AlloyFactory: toHex32("AlloyFactory") as Entity,
  SolarPanel: toHex32("SolarPanel") as Entity,
  Hangar: toHex32("Hangar") as Entity,
  DroneFactory: toHex32("DroneFactory") as Entity,
  StarmapperStation: toHex32("Starmapper") as Entity,

  Alloy: toHex32("Alloy") as Entity,
  PVCell: toHex32("PVCell") as Entity,

  RocketFuel: toHex32("RocketFuel") as Entity,
  U_Electricity: toHex32("U_Electricity") as Entity,
  U_Housing: toHex32("U_Housing") as Entity,
  U_VesselCapacity: toHex32("U_Vessel") as Entity,
  U_FleetMoves: toHex32("U_FleetMoves") as Entity,

  Bullet: toHex32("Bullet") as Entity,
  IronPlate: toHex32("IronPlate") as Entity,
  BasicPowerSource: toHex32("BasicPowerSource") as Entity,
  KineticMissile: toHex32("KineticMissile") as Entity,
  RefinedOsmium: toHex32("RefinedOsmium") as Entity,
  AdvancedPowerSource: toHex32("AdvancedPowerSource") as Entity,
  PenetratingWarhead: toHex32("PenetratingWarhead") as Entity,
  PenetratingMissile: toHex32("PenetratingMissile") as Entity,
  TungstenRods: toHex32("TungstenRods") as Entity,
  IridiumCrystal: toHex32("IridiumCrystal") as Entity,
  IridiumDrillbit: toHex32("IridiumDrillbit") as Entity,
  LaserPowerSource: toHex32("LaserPowerSource") as Entity,
  ThermobaricWarhead: toHex32("ThermobaricWarhead") as Entity,
  ThermobaricMissile: toHex32("ThermobaricMissile") as Entity,
  KimberliteCrystalCatalyst: toHex32("KimberliteCrystalCatalyst") as Entity,

  HammerLightDrone: toHex32("HammerDrone") as Entity,
  StingerDrone: toHex32("StingerDrone") as Entity,
  AnvilLightDrone: toHex32("AnvilDrone") as Entity,
  AegisDrone: toHex32("AegisDrone") as Entity,
  MiningVessel: toHex32("MiningVessel") as Entity,

  MinutemanMarine: toHex32("unit.MinutemanMarine") as Entity,
  TridentMarine: toHex32("unit.TridentMarine") as Entity,

  ExpansionResearch1: encodeEntityLevel("Expansion", 1) as Entity,
  ExpansionResearch2: encodeEntityLevel("Expansion", 2) as Entity,
  ExpansionResearch3: encodeEntityLevel("Expansion", 3) as Entity,
  ExpansionResearch4: encodeEntityLevel("Expansion", 4) as Entity,
  ExpansionResearch5: encodeEntityLevel("Expansion", 5) as Entity,
  ExpansionResearch6: encodeEntityLevel("Expansion", 6) as Entity,
  ExpansionResearch7: encodeEntityLevel("Expansion", 7) as Entity,

  AnvilDroneUpgrade1: encodeEntityLevel("AnvilDrone", 1) as Entity,
  AnvilDroneUpgrade2: encodeEntityLevel("AnvilDrone", 2) as Entity,
  AnvilDroneUpgrade3: encodeEntityLevel("AnvilDrone", 3) as Entity,
  AnvilDroneUpgrade4: encodeEntityLevel("AnvilDrone", 4) as Entity,
  AnvilDroneUpgrade5: encodeEntityLevel("AnvilDrone", 5) as Entity,

  HammerDroneUpgrade1: encodeEntityLevel("HammerDrone", 1) as Entity,
  HammerDroneUpgrade2: encodeEntityLevel("HammerDrone", 2) as Entity,
  HammerDroneUpgrade3: encodeEntityLevel("HammerDrone", 3) as Entity,
  HammerDroneUpgrade4: encodeEntityLevel("HammerDrone", 4) as Entity,
  HammerDroneUpgrade5: encodeEntityLevel("HammerDrone", 5) as Entity,

  AegisDroneUpgrade1: encodeEntityLevel("AegisDrone", 1) as Entity,
  AegisDroneUpgrade2: encodeEntityLevel("AegisDrone", 2) as Entity,
  AegisDroneUpgrade3: encodeEntityLevel("AegisDrone", 3) as Entity,
  AegisDroneUpgrade4: encodeEntityLevel("AegisDrone", 4) as Entity,
  AegisDroneUpgrade5: encodeEntityLevel("AegisDrone", 5) as Entity,

  StingerDroneUpgrade1: encodeEntityLevel("StingerDrone", 1) as Entity,
  StingerDroneUpgrade2: encodeEntityLevel("StingerDrone", 2) as Entity,
  StingerDroneUpgrade3: encodeEntityLevel("StingerDrone", 3) as Entity,
  StingerDroneUpgrade4: encodeEntityLevel("StingerDrone", 4) as Entity,
  StingerDroneUpgrade5: encodeEntityLevel("StingerDrone", 5) as Entity,

  MiningVesselUpgrade1: encodeEntityLevel("MiningVessel", 1) as Entity,
  MiningVesselUpgrade2: encodeEntityLevel("MiningVessel", 2) as Entity,
  MiningVesselUpgrade3: encodeEntityLevel("MiningVessel", 3) as Entity,
  MiningVesselUpgrade4: encodeEntityLevel("MiningVessel", 4) as Entity,
  MiningVesselUpgrade5: encodeEntityLevel("MiningVessel", 5) as Entity,

  MinutemanMarineUpgrade1: toHex32("research.MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade2: toHex32("research.MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade3: toHex32("research.MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade4: toHex32("research.MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade5: toHex32("research.MinutemanMarineUpgrade") as Entity,

  TridentMarineUpgrade1: toHex32("research.TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade2: toHex32("research.TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade3: toHex32("research.TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade4: toHex32("research.TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade5: toHex32("research.TridentMarineUpgrade") as Entity,

  MiningResearch1: toHex32("research.MiningResearch") as Entity,
  MiningResearch2: toHex32("research.MiningResearch") as Entity,
  MiningResearch3: toHex32("research.MiningResearch") as Entity,
  MiningResearch4: toHex32("research.MiningResearch") as Entity,
  MiningResearch5: toHex32("research.MiningResearch") as Entity,

  //Objectives
  DebugFreeObjectiveID: toHex32("DebugFreeObj") as Entity,
  DebugHavResourcesObjectiveID: toHex32("DebugHavResourcesObj") as Entity,
  DebugHaveUnitsObjectiveID: toHex32("DebugHaveUnitsObj") as Entity,
  DebugHaveMaxUtilityObjectiveID: toHex32("DebugHaveMaxUtilityObj") as Entity,
  DebugCompletedPriorObjectiveID: toHex32("DebugCompletedPriorObj") as Entity,
  DebugMainBaseLevelObjectiveID: toHex32("DebugMainBaseLevelObj") as Entity,
  DebugTechnologyResearchedObjectiveID: toHex32("DebugTechnologyResearchedObj") as Entity,
  DebugResourceProductionObjectiveID: toHex32("DebugResourceProductionObj") as Entity,
  DebugBuiltBuildingTypeObjectiveID: toHex32("DebugBuiltBuildingTypeObj") as Entity,
  DebugNumberOfBuiltBuildingTypeObjectiveID: toHex32("DebugNumberOfBuiltBuildingObj") as Entity,
  DebugRaidObjectiveID: toHex32("DebugRaidObj") as Entity,
  DebugMotherlodeMiningTitaniumObjectiveID: toHex32("DebugMotherlodeMiningTitaniumObj") as Entity,
  DebugMotherlodeMiningPlatinumObjectiveID: toHex32("DebugMotherlodeMiningPlatinumObj") as Entity,
  DebugMotherlodeMiningIridiumObjectiveID: toHex32("DebugMotherlodeMiningIridiumObj") as Entity,
  DebugMotherlodeMiningKimberliteObjectiveID: toHex32("DebugMotherlodeKimberliteObj") as Entity,
  DebugDestroyedUnitsObjectiveID: toHex32("DebugDestroyedUnitsObj") as Entity,
  DebugResourceRewardObjectiveID: toHex32("DebugResourceRewardObj") as Entity,
  DebugUnitsRewardObjectiveID: toHex32("DebugUnitsRewardObjID") as Entity,

  DebugSpawnPirateAsteroid: toHex32("block.DebugSpawnPirateAsteroid") as Entity,

  DebugSpawnPirateAsteroidObjective: toHex32("block.DebugSpawnPirateObj") as Entity,

  DebugDefeatedPirateAsteroidObjective: toHex32("block.DebugDefeatedPirateObj") as Entity,

  BuildFirstIronMine: toHex32("BuildFirstIronMine") as Entity,
  BuildFirstCopperMine: toHex32("BuildFirstCopperMine") as Entity,
  BuildFirstLithiumMine: toHex32("BuildFirstLithiumMine") as Entity,
  BuildFirstSulfurMine: toHex32("BuildFirstSulfurMine") as Entity,

  BuildFirstIronPlateFactory: toHex32("BuildFirstIronPlateFactory") as Entity,
  BuildFirstAlloyFactory: toHex32("BuildFirstAlloyFactory") as Entity,
  BuildFirstPVCellFactory: toHex32("BuildFirstPVCellFactory") as Entity,

  BuildGarage: toHex32("BuildGarage") as Entity,
  BuildDroneFactory: toHex32("BuildDroneFactory") as Entity,
  BuildSolarPanel: toHex32("BuildSolarPanel") as Entity,
  BuildWorkshop: toHex32("BuildWorkshop") as Entity,
  BuildHangar: toHex32("BuildHangar") as Entity,

  TrainMinutemanMarine: toHex32("TrainMinutemanMarine") as Entity,
  TrainMinutemanMarine2: toHex32("TrainMinutemanMarine2") as Entity,
  TrainMinutemanMarine3: toHex32("TrainMinutemanMarine3") as Entity,

  TrainTridentMarine: toHex32("TrainTridentMarine") as Entity,
  TrainTridentMarine2: toHex32("TrainTridentMarine2") as Entity,
  TrainTridentMarine3: toHex32("TrainTridentMarine3") as Entity,
  TrainAnvilDrone: toHex32("TrainAnvilDrone") as Entity,
  TrainAnvilDrone2: toHex32("TrainAnvilDrone2") as Entity,
  TrainAnvilDrone3: toHex32("TrainAnvilDrone3") as Entity,

  DefeatFirstPirateBase: toHex32("DefeatFirstPirateBase") as Entity,
  DefeatSecondPirateBase: toHex32("DefeatSecondPirateBase") as Entity,
  DefeatThirdPirateBase: toHex32("DefeatThirdPirateBase") as Entity,
  DefeatFourthPirateBase: toHex32("DefeatFourthPirateBase") as Entity,
  DefeatFifthPirateBase: toHex32("DefeatFifthPirateBase") as Entity,
  DefeatSixthPirateBase: toHex32("DefeatSixthPirateBase") as Entity,
  DefeatSeventhPirateBase: toHex32("DefeatSeventhPirateBase") as Entity,
  DefeatEighthPirateBase: toHex32("DefeatEighthPirateBase") as Entity,
  DefeatNinthPirateBase: toHex32("DefeatNinthPirateBase") as Entity,
  DefeatTenthPirateBase: toHex32("DefeatTenthPirateBase") as Entity,
  DefeatEleventhPirateBase: toHex32("DefeatEleventhPirateBase") as Entity,

  ExpandBase: toHex32("ExpandBase") as Entity,
  ExpandBase2: toHex32("ExpandBase2") as Entity,
  ExpandBase3: toHex32("ExpandBase3") as Entity,
  ExpandBase4: toHex32("ExpandBase4") as Entity,
  ExpandBase5: toHex32("ExpandBase5") as Entity,
  ExpandBase6: toHex32("ExpandBase6") as Entity,

  RaiseIronPlateProduction: toHex32("RaiseIronPlateProduction") as Entity,

  MineTitanium1: toHex32("MineTitanium1") as Entity,
  MineTitanium2: toHex32("MineTitanium2") as Entity,
  MineTitanium3: toHex32("MineTitanium3") as Entity,

  MinePlatinum1: toHex32("MinePlatinum1") as Entity,
  MinePlatinum2: toHex32("MinePlatinum2") as Entity,
  MinePlatinum3: toHex32("MinePlatinum3") as Entity,

  MineIridium1: toHex32("MineIridium1") as Entity,
  MineIridium2: toHex32("MineIridium2") as Entity,
  MineIridium3: toHex32("MineIridium3") as Entity,

  MineKimberlite1: toHex32("MineKimberlite1") as Entity,
  MineKimberlite2: toHex32("MineKimberlite2") as Entity,
  MineKimberlite3: toHex32("MineKimberlite3") as Entity,

  TrainHammerDrone: toHex32("TrainHammerDrone") as Entity,
  TrainHammerDrone2: toHex32("TrainHammerDrone2") as Entity,
  TrainHammerDrone3: toHex32("TrainHammerDrone3") as Entity,

  TrainAegisDrone: toHex32("TrainAegisDrone") as Entity,
  TrainAegisDrone2: toHex32("TrainAegisDrone2") as Entity,
  TrainAegisDrone3: toHex32("TrainAegisDrone3") as Entity,

  TrainStingerDrone: toHex32("TrainStingerDrone") as Entity,
  TrainStingerDrone2: toHex32("TrainStingerDrone2") as Entity,
  TrainStingerDrone3: toHex32("TrainStingerDrone3") as Entity,

  RaidRawResources: toHex32("RaidRawResources") as Entity,
  RaidRawResources2: toHex32("RaidRawResources2") as Entity,
  RaidRawResources3: toHex32("RaidRawResources3") as Entity,

  RaidFactoryResources: toHex32("RaidFactoryResources") as Entity,
  RaidFactoryResources2: toHex32("RaidFactoryResources2") as Entity,
  RaidFactoryResources3: toHex32("RaidFactoryResources3") as Entity,

  RaidMotherlodeResources: toHex32("RaidMotherlodeResources") as Entity,
  RaidMotherlodeResources2: toHex32("RaidMotherlodeResources2") as Entity,
  RaidMotherlodeResources3: toHex32("RaidMotherlodeResources3") as Entity,

  DestroyEnemyUnits: toHex32("DestroyEnemyUnits") as Entity,
  DestroyEnemyUnits2: toHex32("DestroyEnemyUnits2") as Entity,
  DestroyEnemyUnits3: toHex32("DestroyEnemyUnits3") as Entity,
  DestroyEnemyUnits4: toHex32("DestroyEnemyUnits4") as Entity,
  DestroyEnemyUnits5: toHex32("DestroyEnemyUnits5") as Entity,

  UpgradeMainBase: toHex32("UpgradeMainBase") as Entity,
  CommissionMiningVessel: toHex32("CommissionMiningVessel") as Entity,

  BuildStarmap: toHex32("BuildStarmap") as Entity,
  BuildSAMLauncher: toHex32("BuildSAMLauncher") as Entity,

  //Starmap
  Asteroid: toHex32("spacerock.Asteroid") as Entity,
};

export const getBlockTypeDescription = (blockType: Entity | undefined) => {
  if (blockType === undefined || !BlockDescriptions.has(blockType)) return "";

  return BlockDescriptions.get(blockType);
};

export const BlockIdToKey = Object.entries(BlockType).reduce<{
  [key: Entity]: string;
}>((acc, [key, id]) => {
  acc[id] = key;
  return acc;
}, {});

export const BlockDescriptions = new Map<Entity, string>([
  //landscape blocks
  [
    BlockType.BuildFirstIronMine,
    "Select the iron mine on the building menu below and place it on the iron ore tile. Iron mines produce iron.",
  ],
  [
    BlockType.BuildFirstCopperMine,
    "Select the copper mine on the building menu below and place it on the copper ore tile. Copper mines produce copper.",
  ],
  [
    BlockType.BuildFirstLithiumMine,
    "Select the lithium mine on the building menu below and place it on the lithium ore tile. Lithium mines produce lithium.",
  ],
  [
    BlockType.BuildFirstSulfurMine,
    "Select the sulfur mine on the building menu below and place it on the sulfur ore tile. Sulfur mines produce sulfur.",
  ],
  [
    BlockType.BuildFirstIronPlateFactory,
    "Select the plating factory on the building menu and place it on an empty tile. It produces iron plates by consuming iron production.",
  ],
  [
    BlockType.BuildFirstAlloyFactory,
    "Select the alloy factory on the building menu and place it on an empty tile. It produces alloy by consuming iron and copper production.",
  ],
  [
    BlockType.BuildFirstPVCellFactory,
    "Select the photovoltaic cell factory on the building menu and place it on an empty tile. It produces photovoltaic cells by consuming copper and lithium production.",
  ],
  [
    BlockType.BuildGarage,
    "Select the garage from the building menu and place it on an empty tile. Garages provide housing for units. ",
  ],
  [
    BlockType.BuildWorkshop,
    "Select the workshop from the building menu and place it on an empty tile. Workshops train basic units, like marines.",
  ],
  [
    BlockType.BuildSolarPanel,
    "Select the solar panel from the building menu and place it on an empty tile. Solar panels provide electricity, which is used for advanced buildings.",
  ],
  [
    BlockType.BuildDroneFactory,
    "Select the drone factory from the building menu and place it on an empty tile. Drone factories train drones, which travel faster and are stronger.",
  ],
  [
    BlockType.BuildHangar,
    "Select the hangar from the building menu and place it on an empty tile. Hangars provide more housing than garages for units.",
  ],
  [
    BlockType.TrainMinutemanMarine,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],
  [
    BlockType.TrainMinutemanMarine2,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],
  [
    BlockType.TrainMinutemanMarine3,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],

  [
    BlockType.TrainTridentMarine,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    BlockType.TrainTridentMarine2,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    BlockType.TrainTridentMarine3,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    BlockType.TrainAnvilDrone,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    BlockType.TrainAnvilDrone2,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    BlockType.TrainAnvilDrone3,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    BlockType.DefeatFirstPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatSecondPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatThirdPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatFourthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatFifthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatSixthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatSeventhPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatEighthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatNinthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatTenthPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.DefeatEleventhPirateBase,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    BlockType.ExpandBase,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.ExpandBase2,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.ExpandBase3,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.ExpandBase4,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.ExpandBase5,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.ExpandBase6,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    BlockType.MineTitanium1,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],
  [
    BlockType.MineTitanium2,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],
  [
    BlockType.MineTitanium3,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],

  [
    BlockType.MinePlatinum1,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],
  [
    BlockType.MinePlatinum2,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],
  [
    BlockType.MinePlatinum3,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],

  [
    BlockType.MineIridium1,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],
  [
    BlockType.MineIridium2,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],
  [
    BlockType.MineIridium3,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],

  [
    BlockType.MineKimberlite1,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],
  [
    BlockType.MineKimberlite2,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],
  [
    BlockType.MineKimberlite3,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],

  [
    BlockType.TrainHammerDrone,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],
  [
    BlockType.TrainHammerDrone2,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],
  [
    BlockType.TrainHammerDrone3,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],

  [
    BlockType.TrainAegisDrone,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],
  [
    BlockType.TrainAegisDrone2,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],
  [
    BlockType.TrainAegisDrone3,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],

  [
    BlockType.TrainStingerDrone,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],
  [
    BlockType.TrainStingerDrone2,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],
  [
    BlockType.TrainStingerDrone3,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],

  [BlockType.UpgradeMainBase, "Upgrade your main base by clicking on the upgrade button in your main base."],

  [
    BlockType.CommissionMiningVessel,
    "Commission one mining vessel at your main base by first adding a slot and then building one mining vessel.",
  ],

  [
    BlockType.BuildStarmap,
    "Construct a starmapper station. A starmapper station increases the number of fleets you can send at a time.",
  ],

  [
    BlockType.BuildSAMLauncher,
    "Construct a SAM site. SAM sites protect you from enemy attacks and raids by providing a base level of defense.",
  ],
  [
    BlockType.RaidRawResources,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidRawResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidRawResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],

  [
    BlockType.RaidFactoryResources,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidFactoryResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidFactoryResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],

  [
    BlockType.RaidMotherlodeResources,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidMotherlodeResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    BlockType.RaidMotherlodeResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [BlockType.DestroyEnemyUnits, "Attack and defend against enemy units and destroy your enemies' armies."],
  [BlockType.DestroyEnemyUnits2, "Attack and defend against enemy units and destroy your enemies' armies."],
  [BlockType.DestroyEnemyUnits3, "Attack and defend against enemy units and destroy your enemies' armies."],
  [BlockType.DestroyEnemyUnits4, "Attack and defend against enemy units and destroy your enemies' armies."],
  [BlockType.DestroyEnemyUnits5, "Attack and defend against enemy units and destroy your enemies' armies."],
]);

// Terrain Tile colors
//todo: pick ore block colors
export const BlockColors = new Map<Entity, string>([
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

export const BackgroundImage = new Map<Entity, string[]>([
  //units
  [BlockType.HammerLightDrone, ["/img/unit/hammerdrone.png"]],
  [BlockType.StingerDrone, ["/img/unit/stingerdrone.png"]],
  [BlockType.AnvilLightDrone, ["/img/unit/anvildrone.png"]],
  [BlockType.AegisDrone, ["/img/unit/aegisdrone.png"]],
  [BlockType.MiningVessel, ["/img/unit/miningvessel.png"]],

  [BlockType.MinutemanMarine, ["/img/unit/minutemen_marine.png"]],
  [BlockType.TridentMarine, ["/img/unit/trident_marine.png"]],
]);

export const ResearchImage = new Map<Entity, string>([
  [BlockType.Iron, "/img/resource/iron_resource.png"],
  [BlockType.Copper, "/img/resource/copper_resource.png"],
  [BlockType.Lithium, "/img/resource/lithium_resource.png"],
  [BlockType.Sulfur, "/img/resource/sulfur_resource.png"],
  [BlockType.Titanium, "/img/resource/titanium_resource.png"],
  [BlockType.Osmium, "/img/resource/osmium_resource.png"],
  [BlockType.Tungsten, "/img/resource/tungsten_resource.png"],
  [BlockType.Iridium, "/img/resource/iridium_resource.png"],
  [BlockType.Kimberlite, "/img/resource/kimberlite_resource.png"],

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

  [BlockType.TridentMarineUpgrade1, "img/unit/trident_marine.png"],
  [BlockType.TridentMarineUpgrade2, "img/unit/trident_marine.png"],
  [BlockType.TridentMarineUpgrade3, "img/unit/trident_marine.png"],
  [BlockType.TridentMarineUpgrade4, "img/unit/trident_marine.png"],
  [BlockType.TridentMarineUpgrade5, "img/unit/trident_marine.png"],

  [BlockType.MinutemanMarineUpgrade1, "img/unit/minutemen_marine.png"],
  [BlockType.MinutemanMarineUpgrade2, "img/unit/minutemen_marine.png"],
  [BlockType.MinutemanMarineUpgrade3, "img/unit/minutemen_marine.png"],
  [BlockType.MinutemanMarineUpgrade4, "img/unit/minutemen_marine.png"],
  [BlockType.MinutemanMarineUpgrade5, "img/unit/minutemen_marine.png"],
]);
//images of resource items (think of them like minecraft entities)
export const ResourceImage = new Map<Entity, string>([
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
  [BlockType.Platinum, "/img/resource/platinum_resource.png"],

  [BlockType.IronPlate, "/img/crafted/ironplate.png"],
  [BlockType.BasicPowerSource, "/img/crafted/basicbattery.png"],
  [BlockType.AdvancedPowerSource, "/img/crafted/photovoltaiccell.png"],
  [BlockType.IridiumCrystal, "/img/crafted/iridiumcrystal.png"],
  [BlockType.IridiumDrillbit, "/img/crafted/iridiumdrillbit.png"],
  [BlockType.LaserPowerSource, "/img/crafted/laserbattery.png"],
  [BlockType.KimberliteCrystalCatalyst, "/img/crafted/kimberlitecatalyst.png"],
  [BlockType.RefinedOsmium, "/img/crafted/refinedosmium.png"],
  [BlockType.TungstenRods, "/img/crafted/tungstenrod.png"],
  [BlockType.KineticMissile, "/img/crafted/kineticmissile.png"],
  [BlockType.PenetratingWarhead, "/img/crafted/penetratingwarhead.png"],
  [BlockType.PenetratingMissile, "/img/crafted/penetratingmissile.png"],
  [BlockType.ThermobaricWarhead, "/img/crafted/thermobaricwarhead.png"],
  [BlockType.ThermobaricMissile, "/img/crafted/thermobaricmissile.png"],

  [BlockType.Alloy, "/img/resource/alloy_resource.png"],
  [BlockType.PVCell, "/img/resource/photovoltaiccell_resource.png"],
  [BlockType.RocketFuel, "/img/crafted/refinedosmium.png"],

  [BlockType.U_Electricity, "/img/icons/powericon.png"],
  [BlockType.U_Housing, "/img/icons/utilitiesicon.png"],
  [BlockType.U_VesselCapacity, "/img/unit/miningvessel.png"],

  // debug
  [BlockType.Bullet, "/img/crafted/bullet.png"],

  //units
  [BlockType.HammerLightDrone, "/img/unit/hammerdrone.png"],
  [BlockType.StingerDrone, "/img/unit/stingerdrone.png"],
  [BlockType.AnvilLightDrone, "/img/unit/anvildrone.png"],
  [BlockType.AegisDrone, "/img/unit/aegisdrone.png"],
  [BlockType.MiningVessel, "/img/unit/miningvessel.png"],
  [BlockType.MinutemanMarine, "img/unit/minutemen_marine.png"],
  [BlockType.TridentMarine, "img/unit/trident_marine.png"],
]);

export type DisplayKeyPair = {
  terrain: Entity | null;
  resource: Entity | null;
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
  [ESize.SMALL]: "Small",
  [ESize.MEDIUM]: "Medium",
  [ESize.LARGE]: "Large",
};

// do the same for types
export const MotherlodeTypeNames: Record<number, string> = {
  [EMotherlodeType.TITANIUM]: "Titanium",
  [EMotherlodeType.IRIDIUM]: "Iridium",
  [EMotherlodeType.PLATINUM]: "Platinum",
  [EMotherlodeType.KIMBERLITE]: "Kimberlite",
};

export const SpaceRockTypeNames: Record<number, string> = {
  [ERock.Asteroid]: "Asteroid",
  [ERock.Motherlode]: "Motherlode",
};

export const ResourceStorages = [
  BlockType.Iron,
  BlockType.Copper,
  BlockType.Lithium,
  BlockType.IronPlate,
  BlockType.Alloy,
  BlockType.PVCell,
  BlockType.Sulfur,
  BlockType.Titanium,
  BlockType.Iridium,
  BlockType.Platinum,
  BlockType.Kimberlite,
];

export const UtilityStorages = [
  BlockType.U_Housing,
  BlockType.U_Electricity,
  BlockType.U_VesselCapacity,
  BlockType.U_FleetMoves,
];
