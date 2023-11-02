import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { EBuilding, EObjectives, EResource, ERock, ESize, EUnit } from "contracts/config/enums";
import { Key } from "engine/types";
import { toHex } from "viem";
import { reverseRecord } from "./common";

export const toHex32 = (input: string) => toHex(input, { size: 32 });
export const encodeEntityLevel = (entity: string, level: number) => {
  return encodeEntity({ entity: "bytes32", level: "uint256" }, { entity: toHex32(entity), level: BigInt(level) });
};

export enum Action {
  DemolishBuilding,
  SelectBuilding,
  PlaceBuilding,
  MoveBuilding,
}

export const SPEED_SCALE = BigInt(100);
export const RESOURCE_SCALE = BigInt(100);
export const MULTIPLIER_SCALE = BigInt(100);

export const PIRATE_KEY = toHex32("pirate");
export const NUM_UNITS = Object.keys(EUnit).length / 2;

export enum ResourceType {
  Resource,
  ResourceRate,
  Utility,
  Multiplier,
}

export enum RewardType {
  Resource,
  Unit,
}

export enum RequirementType {
  Objectives,
  MainBase,
  Expansion,
  Buildings,
  ProducedResources,
  RaidedResources,
  DestroyedUnits,
  ProducedUnits,
  RequiredUnits,
  DefeatedPirates,
}

export enum TransactionQueueType {
  Build,
  Train,
  Research,
  Upgrade,
  Recall,
  Reinforce,
  Land,
  Demolish,
  ClaimObjective,
}

export enum RockRelationship {
  Ally,
  Enemy,
  Neutral,
  Self,
}

export type TransactionQueueMetadataTypes = {
  [TransactionQueueType.Build]: {
    coord: Coord;
    buildingType: Entity;
  };
};

export const key = {
  BuildingTileKey: toHex32("building:tile"),
  ExpansionKey: toHex32("Expansion"),
  BuildingKey: toHex32("Building"),
  UnitKey: toHex32("Unit"),
};

export const EntityType = {
  // Ores
  Water: toHex32("Water") as Entity,
  Lithium: toHex32("Lithium") as Entity,
  Iron: toHex32("Iron") as Entity,
  Copper: toHex32("Copper") as Entity,
  Titanium: toHex32("Titanium") as Entity,
  Iridium: toHex32("Iridium") as Entity,
  Sulfur: toHex32("Sulfur") as Entity,
  Osmium: toHex32("Osmium") as Entity,
  Tungsten: toHex32("Tungsten") as Entity,
  Kimberlite: toHex32("Kimberlite") as Entity,
  Uraninite: toHex32("Uraninite") as Entity,
  Bolutite: toHex32("Bolutite") as Entity,
  Platinum: toHex32("Platinum") as Entity,

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
  Garage: toHex32("Garage") as Entity,
  Workshop: toHex32("Workshop") as Entity,

  //Advanced Buildings
  IronPlateFactory: toHex32("IronPlateFactory") as Entity,
  PVCellFactory: toHex32("PVCellFactory") as Entity,
  AlloyFactory: toHex32("AlloyFactory") as Entity,
  SolarPanel: toHex32("SolarPanel") as Entity,
  Hangar: toHex32("Hangar") as Entity,
  DroneFactory: toHex32("DroneFactory") as Entity,
  StarmapperStation: toHex32("Starmapper") as Entity,
  SAMLauncher: toHex32("SAM") as Entity,
  ShieldGenerator: toHex32("ShieldGenerator") as Entity,
  Vault: toHex32("Vault") as Entity,

  Alloy: toHex32("Alloy") as Entity,
  PVCell: toHex32("PVCell") as Entity,

  RocketFuel: toHex32("RocketFuel") as Entity,
  Electricity: toHex32("U_Electricity") as Entity,
  Housing: toHex32("U_Housing") as Entity,
  VesselCapacity: toHex32("U_Vessel") as Entity,
  FleetMoves: toHex32("U_MaxMoves") as Entity,

  Defense: toHex32("U_Defense") as Entity,
  DefenseMultiplier: toHex32("M_DefenseMultiplier") as Entity,

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

  HammerDrone: toHex32("HammerDrone") as Entity,
  StingerDrone: toHex32("StingerDrone") as Entity,
  AnvilDrone: toHex32("AnvilDrone") as Entity,
  AegisDrone: toHex32("AegisDrone") as Entity,
  MiningVessel: toHex32("MiningVessel") as Entity,

  MinutemanMarine: toHex32("MinutemanMarine") as Entity,
  TridentMarine: toHex32("TridentMarine") as Entity,

  Expansion: toHex32("Expansion") as Entity,
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

  MinutemanMarineUpgrade1: toHex32("MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade2: toHex32("MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade3: toHex32("MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade4: toHex32("MinutemanMarineUpgrade") as Entity,
  MinutemanMarineUpgrade5: toHex32("MinutemanMarineUpgrade") as Entity,

  TridentMarineUpgrade1: toHex32("TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade2: toHex32("TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade3: toHex32("TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade4: toHex32("TridentMarineUpgrade") as Entity,
  TridentMarineUpgrade5: toHex32("TridentMarineUpgrade") as Entity,

  MiningResearch1: toHex32("MiningResearch") as Entity,
  MiningResearch2: toHex32("MiningResearch") as Entity,
  MiningResearch3: toHex32("MiningResearch") as Entity,
  MiningResearch4: toHex32("MiningResearch") as Entity,
  MiningResearch5: toHex32("MiningResearch") as Entity,

  //Objectives
  ...Object.keys(EObjectives).reduce((acc, key) => {
    if (!isNaN(Number(key))) return acc;
    return { ...acc, [key]: toHex32(key) as Entity };
  }, {}),

  //Starmap
  Asteroid: toHex32("spacerock.Asteroid") as Entity,

  NULL: toHex32("NULL") as Entity,
};

export const BlockIdToKey = Object.entries(EntityType).reduce<{
  [key: Entity]: string;
}>((acc, [key, id]) => {
  acc[id] = key;
  return acc;
}, {});

export const BackgroundImage = new Map<Entity, string[]>([
  //units
  [EntityType.HammerDrone, ["/img/unit/hammerdrone.png"]],
  [EntityType.StingerDrone, ["/img/unit/stingerdrone.png"]],
  [EntityType.AnvilDrone, ["/img/unit/anvildrone.png"]],
  [EntityType.AegisDrone, ["/img/unit/aegisdrone.png"]],
  [EntityType.MiningVessel, ["/img/unit/miningvessel.png"]],

  [EntityType.MinutemanMarine, ["/img/unit/minutemen_marine.png"]],
  [EntityType.TridentMarine, ["/img/unit/trident_marine.png"]],
]);

export const ResearchImage = new Map<Entity, string>([
  [EntityType.Iron, "/img/resource/iron_resource.png"],
  [EntityType.Copper, "/img/resource/copper_resource.png"],
  [EntityType.Lithium, "/img/resource/lithium_resource.png"],
  [EntityType.Sulfur, "/img/resource/sulfur_resource.png"],
  [EntityType.Titanium, "/img/resource/titanium_resource.png"],
  [EntityType.Osmium, "/img/resource/osmium_resource.png"],
  [EntityType.Tungsten, "/img/resource/tungsten_resource.png"],
  [EntityType.Iridium, "/img/resource/iridium_resource.png"],
  [EntityType.Kimberlite, "/img/resource/kimberlite_resource.png"],

  [EntityType.ExpansionResearch1, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch2, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch3, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch4, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch5, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch6, "/img/icons/mainbaseicon.png"],
  [EntityType.ExpansionResearch7, "/img/icons/mainbaseicon.png"],

  [EntityType.AnvilDroneUpgrade1, "/img/unit/anvildrone.png"],
  [EntityType.AnvilDroneUpgrade2, "/img/unit/anvildrone.png"],
  [EntityType.AnvilDroneUpgrade3, "/img/unit/anvildrone.png"],
  [EntityType.AnvilDroneUpgrade4, "/img/unit/anvildrone.png"],
  [EntityType.AnvilDroneUpgrade5, "/img/unit/anvildrone.png"],

  [EntityType.HammerDroneUpgrade1, "/img/unit/hammerdrone.png"],
  [EntityType.HammerDroneUpgrade2, "/img/unit/hammerdrone.png"],
  [EntityType.HammerDroneUpgrade3, "/img/unit/hammerdrone.png"],
  [EntityType.HammerDroneUpgrade4, "/img/unit/hammerdrone.png"],
  [EntityType.HammerDroneUpgrade5, "/img/unit/hammerdrone.png"],

  [EntityType.AegisDroneUpgrade1, "/img/unit/aegisdrone.png"],
  [EntityType.AegisDroneUpgrade2, "/img/unit/aegisdrone.png"],
  [EntityType.AegisDroneUpgrade3, "/img/unit/aegisdrone.png"],
  [EntityType.AegisDroneUpgrade4, "/img/unit/aegisdrone.png"],
  [EntityType.AegisDroneUpgrade5, "/img/unit/aegisdrone.png"],

  [EntityType.StingerDroneUpgrade1, "/img/unit/stingerdrone.png"],
  [EntityType.StingerDroneUpgrade2, "/img/unit/stingerdrone.png"],
  [EntityType.StingerDroneUpgrade3, "/img/unit/stingerdrone.png"],
  [EntityType.StingerDroneUpgrade4, "/img/unit/stingerdrone.png"],
  [EntityType.StingerDroneUpgrade5, "/img/unit/stingerdrone.png"],

  [EntityType.MiningResearch1, "/img/unit/miningvessel.png"],
  [EntityType.MiningResearch2, "/img/unit/miningvessel.png"],
  [EntityType.MiningResearch3, "/img/unit/miningvessel.png"],
  [EntityType.MiningResearch4, "/img/unit/miningvessel.png"],
  [EntityType.MiningResearch5, "/img/unit/miningvessel.png"],

  [EntityType.MiningVesselUpgrade1, "/img/unit/miningvessel.png"],
  [EntityType.MiningVesselUpgrade2, "/img/unit/miningvessel.png"],
  [EntityType.MiningVesselUpgrade3, "/img/unit/miningvessel.png"],
  [EntityType.MiningVesselUpgrade4, "/img/unit/miningvessel.png"],
  [EntityType.MiningVesselUpgrade5, "/img/unit/miningvessel.png"],

  [EntityType.TridentMarineUpgrade1, "img/unit/trident_marine.png"],
  [EntityType.TridentMarineUpgrade2, "img/unit/trident_marine.png"],
  [EntityType.TridentMarineUpgrade3, "img/unit/trident_marine.png"],
  [EntityType.TridentMarineUpgrade4, "img/unit/trident_marine.png"],
  [EntityType.TridentMarineUpgrade5, "img/unit/trident_marine.png"],

  [EntityType.MinutemanMarineUpgrade1, "img/unit/minutemen_marine.png"],
  [EntityType.MinutemanMarineUpgrade2, "img/unit/minutemen_marine.png"],
  [EntityType.MinutemanMarineUpgrade3, "img/unit/minutemen_marine.png"],
  [EntityType.MinutemanMarineUpgrade4, "img/unit/minutemen_marine.png"],
  [EntityType.MinutemanMarineUpgrade5, "img/unit/minutemen_marine.png"],
]);
//images of resource items (think of them like minecraft entities)
export const ResourceImage = new Map<Entity, string>([
  [EntityType.Iron, "/img/resource/iron_resource.png"],
  [EntityType.Copper, "/img/resource/copper_resource.png"],
  [EntityType.Lithium, "/img/resource/lithium_resource.png"],
  [EntityType.Titanium, "/img/resource/titanium_resource.png"],
  [EntityType.Sulfur, "/img/resource/sulfur_resource.png"],
  [EntityType.Osmium, "/img/resource/osmium_resource.png"],
  [EntityType.Tungsten, "/img/resource/tungsten_resource.png"],
  [EntityType.Iridium, "/img/resource/iridium_resource.png"],
  [EntityType.Kimberlite, "/img/resource/kimberlite_resource.png"],
  [EntityType.Uraninite, "/img/resource/uraninite_resource.png"],
  [EntityType.Bolutite, "/img/resource/bolutite_resource.png"],
  [EntityType.Platinum, "/img/resource/platinum_resource.png"],

  [EntityType.IronPlate, "/img/crafted/ironplate.png"],
  [EntityType.BasicPowerSource, "/img/crafted/basicbattery.png"],
  [EntityType.AdvancedPowerSource, "/img/crafted/photovoltaiccell.png"],
  [EntityType.IridiumCrystal, "/img/crafted/iridiumcrystal.png"],
  [EntityType.IridiumDrillbit, "/img/crafted/iridiumdrillbit.png"],
  [EntityType.LaserPowerSource, "/img/crafted/laserbattery.png"],
  [EntityType.KimberliteCrystalCatalyst, "/img/crafted/kimberlitecatalyst.png"],
  [EntityType.RefinedOsmium, "/img/crafted/refinedosmium.png"],
  [EntityType.TungstenRods, "/img/crafted/tungstenrod.png"],
  [EntityType.KineticMissile, "/img/crafted/kineticmissile.png"],
  [EntityType.PenetratingWarhead, "/img/crafted/penetratingwarhead.png"],
  [EntityType.PenetratingMissile, "/img/crafted/penetratingmissile.png"],
  [EntityType.ThermobaricWarhead, "/img/crafted/thermobaricwarhead.png"],
  [EntityType.ThermobaricMissile, "/img/crafted/thermobaricmissile.png"],

  [EntityType.Alloy, "/img/resource/alloy_resource.png"],
  [EntityType.PVCell, "/img/resource/photovoltaiccell_resource.png"],
  [EntityType.RocketFuel, "/img/crafted/refinedosmium.png"],

  [EntityType.Electricity, "/img/icons/powericon.png"],
  [EntityType.Housing, "/img/icons/utilitiesicon.png"],
  [EntityType.FleetMoves, "/img/icons/moveicon.png"],
  [EntityType.VesselCapacity, "/img/unit/miningvessel.png"],
  [EntityType.Defense, "/img/resource/defense_resource.png"],
  [EntityType.DefenseMultiplier, "/img/resource/defense_resource.png"],

  // debug
  [EntityType.Bullet, "/img/crafted/bullet.png"],

  //units
  [EntityType.HammerDrone, "/img/unit/hammerdrone.png"],
  [EntityType.StingerDrone, "/img/unit/stingerdrone.png"],
  [EntityType.AnvilDrone, "/img/unit/anvildrone.png"],
  [EntityType.AegisDrone, "/img/unit/aegisdrone.png"],
  [EntityType.MiningVessel, "/img/unit/miningvessel.png"],
  [EntityType.MinutemanMarine, "img/unit/minutemen_marine.png"],
  [EntityType.TridentMarine, "img/unit/trident_marine.png"],
  [EntityType.Vault, "img/vault.png"],
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
  [ESize.Small]: "Small",
  [ESize.Medium]: "Medium",
  [ESize.Large]: "Large",
};

// do the same for types
export const MotherlodeTypeNames: Record<number, string> = {
  [EResource.Titanium]: "Titanium",
  [EResource.Iridium]: "Iridium",
  [EResource.Platinum]: "Platinum",
  [EResource.Kimberlite]: "Kimberlite",
};

export const SpaceRockTypeNames: Record<number, string> = {
  [ERock.Asteroid]: "Asteroid",
  [ERock.Motherlode]: "Motherlode",
};

export const ResourceStorages = new Set([
  EntityType.Iron,
  EntityType.Copper,
  EntityType.Lithium,
  EntityType.IronPlate,
  EntityType.Alloy,
  EntityType.PVCell,
  EntityType.Sulfur,
  EntityType.Titanium,
  EntityType.Iridium,
  EntityType.Platinum,
  EntityType.Kimberlite,
]);

export const UtilityStorages = new Set([
  EntityType.Housing,
  EntityType.Electricity,
  EntityType.VesselCapacity,
  EntityType.FleetMoves,
  EntityType.Defense,
]);

export const MultiplierStorages = new Set([EntityType.DefenseMultiplier]);

export const ResourceEnumLookup: Record<Entity, EResource> = {
  [EntityType.Iron]: EResource.Iron,
  [EntityType.Copper]: EResource.Copper,
  [EntityType.Lithium]: EResource.Lithium,
  [EntityType.Sulfur]: EResource.Sulfur,
  [EntityType.Titanium]: EResource.Titanium,
  [EntityType.Iridium]: EResource.Iridium,
  [EntityType.Platinum]: EResource.Platinum,
  [EntityType.Kimberlite]: EResource.Kimberlite,
  [EntityType.Uraninite]: EResource.Uraninite,
  [EntityType.Bolutite]: EResource.Bolutite,
  [EntityType.Osmium]: EResource.Osmium,
  [EntityType.Tungsten]: EResource.Tungsten,
  [EntityType.Alloy]: EResource.Alloy,
  [EntityType.PVCell]: EResource.PVCell,
  [EntityType.RocketFuel]: EResource.RocketFuel,
  [EntityType.IronPlate]: EResource.IronPlate,

  [EntityType.Electricity]: EResource.U_Electricity,
  [EntityType.Housing]: EResource.U_Housing,
  [EntityType.VesselCapacity]: EResource.U_Vessel,
  [EntityType.FleetMoves]: EResource.U_MaxMoves,
  [EntityType.Defense]: EResource.U_Defense,

  [EntityType.DefenseMultiplier]: EResource.M_DefenseMultiplier,
};

export const ResourceEntityLookup = reverseRecord(ResourceEnumLookup);

export const BuildingEnumLookup: Record<Entity, EBuilding> = {
  [EntityType.IronMine]: EBuilding.IronMine,
  [EntityType.CopperMine]: EBuilding.CopperMine,
  [EntityType.LithiumMine]: EBuilding.LithiumMine,
  [EntityType.SulfurMine]: EBuilding.SulfurMine,
  [EntityType.IronPlateFactory]: EBuilding.IronPlateFactory,
  [EntityType.AlloyFactory]: EBuilding.AlloyFactory,
  [EntityType.PVCellFactory]: EBuilding.PVCellFactory,
  [EntityType.Garage]: EBuilding.Garage,
  [EntityType.Workshop]: EBuilding.Workshop,
  [EntityType.StorageUnit]: EBuilding.StorageUnit,
  [EntityType.SolarPanel]: EBuilding.SolarPanel,
  [EntityType.DroneFactory]: EBuilding.DroneFactory,
  [EntityType.Hangar]: EBuilding.Hangar,
  [EntityType.MainBase]: EBuilding.MainBase,
  [EntityType.SAMLauncher]: EBuilding.SAM,
  [EntityType.StarmapperStation]: EBuilding.Starmapper,
  [EntityType.ShieldGenerator]: EBuilding.ShieldGenerator,
  [EntityType.Vault]: EBuilding.Vault,
};

export const BuildingEntityLookup = reverseRecord(BuildingEnumLookup);

export const UnitEnumLookup: Record<Entity, EUnit> = {
  [EntityType.HammerDrone]: EUnit.HammerDrone,
  [EntityType.StingerDrone]: EUnit.StingerDrone,
  [EntityType.AnvilDrone]: EUnit.AnvilDrone,
  [EntityType.AegisDrone]: EUnit.AegisDrone,
  [EntityType.MiningVessel]: EUnit.MiningVessel,
  [EntityType.MinutemanMarine]: EUnit.MinutemanMarine,
  [EntityType.TridentMarine]: EUnit.TridentMarine,
};

export const UnitEntityLookup = reverseRecord(UnitEnumLookup);
export const ObjectiveEnumLookup: Record<Entity, EObjectives> = {
  ...Object.keys(EObjectives).reduce((acc, key) => {
    const elem = EObjectives[key as keyof typeof EObjectives];
    if (typeof elem === "number") {
      return { ...acc, [toHex32(key)]: elem };
    }
    return acc;
  }, {} as Record<string, EObjectives>),
};

export const ObjectiveEntityLookup = reverseRecord(ObjectiveEnumLookup);
