import { SpriteKeys } from "./constants/assets/sprites";
import { ResourceTilekeys, Tilemaps } from "./constants/assets/tiles";
import { AnimationKeys } from "./constants/assets/animations";
import { EntityType } from "src/util/constants";
import { Entity } from "@latticexyz/recs";
import { AsteroidRelationship, AsteroidSize } from "./constants/common";

export const EntityTypeToTilesetKey: { [key: number]: ResourceTilekeys } = {
  [EntityType.Iron]: ResourceTilekeys.Iron,
  [EntityType.Copper]: ResourceTilekeys.Copper,
  [EntityType.Lithium]: ResourceTilekeys.Lithium,
  [EntityType.Kimberlite]: ResourceTilekeys.Kimberlite,
  [EntityType.Iridium]: ResourceTilekeys.Iridium,
  [EntityType.Platinum]: ResourceTilekeys.Platinum,
  [EntityType.Titanium]: ResourceTilekeys.Titanium,
};

export const EntityTypeToResourceSpriteKey = {
  [EntityType.Iron]: SpriteKeys.Iron,
  [EntityType.Copper]: SpriteKeys.Copper,
  [EntityType.Lithium]: SpriteKeys.Lithium,
  [EntityType.IronPlate]: SpriteKeys.IronPlate,
  [EntityType.PVCell]: SpriteKeys.PVCell,
  [EntityType.Alloy]: SpriteKeys.Alloy,
};

export const EntityTypeToUnitSpriteKey: Record<string, SpriteKeys> = {
  [EntityType.AegisDrone]: SpriteKeys.AegisDrone,
  [EntityType.AnvilDrone]: SpriteKeys.AnvilDrone,
  [EntityType.HammerDrone]: SpriteKeys.HammerDrone,
  [EntityType.StingerDrone]: SpriteKeys.StingerDrone,
  [EntityType.TridentMarine]: SpriteKeys.TridentMarine,
  [EntityType.LightningCraft]: SpriteKeys.LightningCraft,
  [EntityType.MinutemanMarine]: SpriteKeys.MinutemanMarine,
};

export const EntityTypetoBuildingSpriteKey: Record<string, SpriteKeys[]> = {
  [EntityType.MainBase]: [
    SpriteKeys.Mainbase1,
    SpriteKeys.Mainbase2,
    SpriteKeys.Mainbase3,
    SpriteKeys.Mainbase4,
    SpriteKeys.Mainbase5,
    SpriteKeys.Mainbase6,
    SpriteKeys.Mainbase7,
    SpriteKeys.Mainbase8,
  ],

  [EntityType.IronMine]: [SpriteKeys.IronMine1, SpriteKeys.IronMine2, SpriteKeys.IronMine3],

  [EntityType.CopperMine]: [SpriteKeys.CopperMine1, SpriteKeys.CopperMine2, SpriteKeys.CopperMine3],

  [EntityType.LithiumMine]: [SpriteKeys.LithiumMine1],

  [EntityType.KimberliteMine]: [SpriteKeys.KimberliteMine1, SpriteKeys.KimberliteMine2, SpriteKeys.KimberliteMine3],
  [EntityType.IridiumMine]: [SpriteKeys.IridiumMine1, SpriteKeys.IridiumMine2, SpriteKeys.IridiumMine3],
  [EntityType.TitaniumMine]: [SpriteKeys.TitaniumMine1, SpriteKeys.TitaniumMine2, SpriteKeys.TitaniumMine3],
  [EntityType.PlatinumMine]: [SpriteKeys.PlatinumMine1, SpriteKeys.PlatinumMine2, SpriteKeys.PlatinumMine3],

  [EntityType.StorageUnit]: [SpriteKeys.StorageUnit1, SpriteKeys.StorageUnit2, SpriteKeys.StorageUnit3],

  [EntityType.IronPlateFactory]: [SpriteKeys.IronPlateFactory1, SpriteKeys.IronPlateFactory2],

  [EntityType.AlloyFactory]: [SpriteKeys.AlloyFactory1, SpriteKeys.AlloyFactory2, SpriteKeys.AlloyFactory3],

  [EntityType.PVCellFactory]: [SpriteKeys.PhotovoltaicCellFactory1, SpriteKeys.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [SpriteKeys.SolarPanel1, SpriteKeys.SolarPanel2],

  [EntityType.StarmapperStation]: [
    SpriteKeys.StarmapperStation1,
    SpriteKeys.StarmapperStation2,
    SpriteKeys.StarmapperStation3,
  ],

  [EntityType.Hangar]: [SpriteKeys.Hangar1],

  [EntityType.Garage]: [SpriteKeys.Garage1, SpriteKeys.Garage2],

  [EntityType.Workshop]: [SpriteKeys.Workshop1, SpriteKeys.Workshop2, SpriteKeys.Workshop3],

  [EntityType.SAMLauncher]: [SpriteKeys.SAMLauncher1, SpriteKeys.SAMLauncher2, SpriteKeys.SAMLauncher3],

  [EntityType.DroneFactory]: [SpriteKeys.DroneFactory1],

  [EntityType.ShieldGenerator]: [SpriteKeys.ShieldGenerator1, SpriteKeys.ShieldGenerator2, SpriteKeys.ShieldGenerator3],
  [EntityType.Vault]: [SpriteKeys.Vault1, SpriteKeys.Vault2, SpriteKeys.Vault3],
  [EntityType.Market]: [SpriteKeys.Market1],
  [EntityType.Shipyard]: [SpriteKeys.Shipyard1],
  [EntityType.DroidBase]: [SpriteKeys.DroidBase],
};

export const EntityTypeToAnimationKey: Record<string, (AnimationKeys | undefined)[]> = {
  [EntityType.MainBase]: [
    AnimationKeys.Mainbase1,
    AnimationKeys.Mainbase2,
    AnimationKeys.Mainbase3,
    AnimationKeys.Mainbase4,
    AnimationKeys.Mainbase5,
    AnimationKeys.Mainbase6,
    AnimationKeys.Mainbase7,
    AnimationKeys.Mainbase8,
  ],

  [EntityType.IronMine]: [AnimationKeys.IronMine1, AnimationKeys.IronMine2, AnimationKeys.IronMine3],
  [EntityType.CopperMine]: [AnimationKeys.CopperMine1, AnimationKeys.CopperMine2, AnimationKeys.CopperMine3],
  [EntityType.LithiumMine]: [AnimationKeys.LithiumMine1],

  [EntityType.KimberliteMine]: [
    AnimationKeys.KimberliteMine1,
    AnimationKeys.KimberliteMine2,
    AnimationKeys.KimberliteMine3,
  ],
  [EntityType.IridiumMine]: [AnimationKeys.IridiumMine1, AnimationKeys.IridiumMine2, AnimationKeys.IridiumMine3],
  [EntityType.PlatinumMine]: [AnimationKeys.PlatinumMine1, AnimationKeys.PlatinumMine2, AnimationKeys.PlatinumMine3],
  [EntityType.TitaniumMine]: [AnimationKeys.TitaniumMine1, AnimationKeys.TitaniumMine2, AnimationKeys.TitaniumMine3],

  [EntityType.StorageUnit]: [undefined, undefined, AnimationKeys.StorageUnit3],

  [EntityType.IronPlateFactory]: [AnimationKeys.IronPlateFactory1, AnimationKeys.IronPlateFactory2],

  [EntityType.AlloyFactory]: [AnimationKeys.AlloyFactory1, AnimationKeys.AlloyFactory2, AnimationKeys.AlloyFactory3],

  [EntityType.PVCellFactory]: [AnimationKeys.PhotovoltaicCellFactory1, AnimationKeys.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [AnimationKeys.SolarPanel1, AnimationKeys.SolarPanel2],

  [EntityType.StarmapperStation]: [
    AnimationKeys.StarmapperStation1,
    AnimationKeys.StarmapperStation2,
    AnimationKeys.StarmapperStation3,
  ],

  [EntityType.Hangar]: [AnimationKeys.Hangar1],

  [EntityType.Garage]: [AnimationKeys.Garage1, AnimationKeys.Garage2],

  [EntityType.Workshop]: [AnimationKeys.Workshop1, AnimationKeys.Workshop2, AnimationKeys.Workshop3],

  [EntityType.DroneFactory]: [AnimationKeys.DroneFactory1],

  [EntityType.SAMLauncher]: [AnimationKeys.SAMLauncher1, AnimationKeys.SAMLauncher2, AnimationKeys.SAMLauncher3],

  [EntityType.ShieldGenerator]: [
    AnimationKeys.ShieldGenerator1,
    AnimationKeys.ShieldGenerator2,
    AnimationKeys.ShieldGenerator3,
  ],

  [EntityType.Vault]: [AnimationKeys.Vault1, AnimationKeys.Vault2, AnimationKeys.Vault3],
  [EntityType.Market]: [AnimationKeys.Market1],
  [EntityType.Shipyard]: [AnimationKeys.Shipyard1],
  [EntityType.DroidBase]: [AnimationKeys.DroidBase],
};

export const MaxLevelToTilemap: Record<number, Tilemaps> = {
  1: Tilemaps.AsteroidMicro,
  3: Tilemaps.AsteroidSmall,
  5: Tilemaps.AsteroidMedium,
  8: Tilemaps.AsteroidLarge,
};

export const LevelToPrimaryAsteroidSpriteKey: Record<number, SpriteKeys> = {
  1: SpriteKeys.Asteroid1,
  2: SpriteKeys.Asteroid1,
  3: SpriteKeys.Asteroid2,
  4: SpriteKeys.Asteroid2,
  5: SpriteKeys.Asteroid3,
  6: SpriteKeys.Asteroid3,
  7: SpriteKeys.Asteroid4,
  8: SpriteKeys.Asteroid4,
  9: SpriteKeys.Asteroid5,
  10: SpriteKeys.Asteroid5,
};

export const EntityTypeSizeToSecondaryAsteroidSpriteKey = new Map<[Entity, AsteroidSize], SpriteKeys>([
  [[EntityType.Kimberlite, "Micro"], SpriteKeys.MotherlodeKimberliteSmall],
  [[EntityType.Kimberlite, "Small"], SpriteKeys.MotherlodeKimberliteSmall],
  [[EntityType.Kimberlite, "Medium"], SpriteKeys.MotherlodeKimberliteMedium],
  [[EntityType.Kimberlite, "Large"], SpriteKeys.MotherlodeKimberliteLarge],
  [[EntityType.Iridium, "Micro"], SpriteKeys.MotherlodeIridiumSmall],
  [[EntityType.Iridium, "Small"], SpriteKeys.MotherlodeIridiumSmall],
  [[EntityType.Iridium, "Medium"], SpriteKeys.MotherlodeIridiumMedium],
  [[EntityType.Iridium, "Large"], SpriteKeys.MotherlodeIridiumLarge],
  [[EntityType.Platinum, "Micro"], SpriteKeys.MotherlodePlatinumSmall],
  [[EntityType.Platinum, "Small"], SpriteKeys.MotherlodePlatinumSmall],
  [[EntityType.Platinum, "Medium"], SpriteKeys.MotherlodePlatinumMedium],
  [[EntityType.Platinum, "Large"], SpriteKeys.MotherlodePlatinumLarge],
  [[EntityType.Titanium, "Micro"], SpriteKeys.MotherlodeTitaniumSmall],
  [[EntityType.Titanium, "Small"], SpriteKeys.MotherlodeTitaniumSmall],
  [[EntityType.Titanium, "Medium"], SpriteKeys.MotherlodeTitaniumMedium],
  [[EntityType.Titanium, "Large"], SpriteKeys.MotherlodeTitaniumLarge],
]);

export const MaxLevelToAsteroidSpriteSize: Record<number, AsteroidSize> = {
  1: "Micro",
  2: "Micro",
  3: "Small",
  4: "Small",
  5: "Medium",
  6: "Medium",
  7: "Medium",
  8: "Large",
};

export const RelationshipSizeToSecondaryAsteroidOutlineSpriteKey = new Map<
  [AsteroidRelationship, AsteroidSize],
  SpriteKeys
>([
  [["Ally", "Micro"], SpriteKeys.MotherlodeAllianceSmall],
  [["Enemy", "Micro"], SpriteKeys.MotherlodeEnemySmall],
  [["Neutral", "Micro"], SpriteKeys.MotherlodeNeutralSmall],
  [["Self", "Micro"], SpriteKeys.MotherlodePlayerSmall],
  [["Ally", "Small"], SpriteKeys.MotherlodeAllianceMedium],
  [["Enemy", "Small"], SpriteKeys.MotherlodeEnemyMedium],
  [["Neutral", "Small"], SpriteKeys.MotherlodeNeutralMedium],
  [["Self", "Small"], SpriteKeys.MotherlodePlayerSmall],
  [["Ally", "Medium"], SpriteKeys.MotherlodeAllianceLarge],
  [["Enemy", "Medium"], SpriteKeys.MotherlodeEnemyLarge],
  [["Neutral", "Medium"], SpriteKeys.MotherlodeNeutralLarge],
  [["Self", "Medium"], SpriteKeys.MotherlodePlatinumMedium],
  [["Ally", "Large"], SpriteKeys.MotherlodeAllianceLarge],
  [["Enemy", "Large"], SpriteKeys.MotherlodeEnemyLarge],
  [["Neutral", "Large"], SpriteKeys.MotherlodeNeutralLarge],
  [["Self", "Large"], SpriteKeys.MotherlodePlayerLarge],
]);

export const RelationshipToPrimaryAsteroidOutlineSpriteKey: Record<AsteroidRelationship, SpriteKeys> = {
  ["Ally"]: SpriteKeys.AsteroidAlliance,
  ["Neutral"]: SpriteKeys.AsteroidPlayer,
  ["Enemy"]: SpriteKeys.AsteroidEnemy,
  ["Self"]: SpriteKeys.AsteroidPlayer,
};
