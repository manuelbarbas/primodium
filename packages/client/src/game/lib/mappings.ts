import { Entity } from "@latticexyz/recs";
import { Animations, ResourceTilekeys, Sprites, Tilemaps } from "@primodiumxyz/assets";
import { EntityType, Mode } from "src/util/constants";
import { Relationship, AsteroidSize, SceneKeys } from "./constants/common";

export const EntityTypeToResourceTilekey: Record<Entity, ResourceTilekeys> = {
  [EntityType.Iron]: ResourceTilekeys.Iron,
  [EntityType.Copper]: ResourceTilekeys.Copper,
  [EntityType.Lithium]: ResourceTilekeys.Lithium,
  [EntityType.Kimberlite]: ResourceTilekeys.Kimberlite,
  [EntityType.Iridium]: ResourceTilekeys.Iridium,
  [EntityType.Platinum]: ResourceTilekeys.Platinum,
  [EntityType.Titanium]: ResourceTilekeys.Titanium,
};

export const EntityTypeToResourceSprites = {
  [EntityType.Iron]: Sprites.Iron,
  [EntityType.Copper]: Sprites.Copper,
  [EntityType.Lithium]: Sprites.Lithium,
  [EntityType.IronPlate]: Sprites.IronPlate,
  [EntityType.PVCell]: Sprites.PVCell,
  [EntityType.Alloy]: Sprites.Alloy,
};

export const EntityTypeToUnitSprites: Record<Entity, Sprites> = {
  [EntityType.AegisDrone]: Sprites.AegisDrone,
  [EntityType.AnvilDrone]: Sprites.AnvilDrone,
  [EntityType.HammerDrone]: Sprites.HammerDrone,
  [EntityType.StingerDrone]: Sprites.StingerDrone,
  [EntityType.TridentMarine]: Sprites.TridentMarine,
  [EntityType.LightningCraft]: Sprites.LightningCraft,
  [EntityType.MinutemanMarine]: Sprites.MinutemanMarine,
};

export const EntityTypetoBuildingSprites: Record<Entity, Sprites[]> = {
  [EntityType.MainBase]: [
    Sprites.Mainbase1,
    Sprites.Mainbase2,
    Sprites.Mainbase3,
    Sprites.Mainbase4,
    Sprites.Mainbase5,
    Sprites.Mainbase6,
    Sprites.Mainbase7,
    Sprites.Mainbase8,
  ],
  [EntityType.WormholeBase]: [
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
    Sprites.Wormholebase1,
  ],

  [EntityType.IronMine]: [Sprites.IronMine1, Sprites.IronMine2, Sprites.IronMine3],

  [EntityType.CopperMine]: [Sprites.CopperMine1, Sprites.CopperMine2, Sprites.CopperMine3],

  [EntityType.LithiumMine]: [Sprites.LithiumMine1],

  [EntityType.KimberliteMine]: [Sprites.KimberliteMine1, Sprites.KimberliteMine2, Sprites.KimberliteMine3],
  [EntityType.IridiumMine]: [Sprites.IridiumMine1, Sprites.IridiumMine2, Sprites.IridiumMine3],
  [EntityType.TitaniumMine]: [Sprites.TitaniumMine1, Sprites.TitaniumMine2, Sprites.TitaniumMine3],
  [EntityType.PlatinumMine]: [Sprites.PlatinumMine1, Sprites.PlatinumMine2, Sprites.PlatinumMine3],

  [EntityType.StorageUnit]: [Sprites.StorageUnit1, Sprites.StorageUnit2, Sprites.StorageUnit3],

  [EntityType.IronPlateFactory]: [Sprites.IronPlateFactory1, Sprites.IronPlateFactory2],

  [EntityType.AlloyFactory]: [Sprites.AlloyFactory1, Sprites.AlloyFactory2, Sprites.AlloyFactory3],

  [EntityType.PVCellFactory]: [Sprites.PhotovoltaicCellFactory1, Sprites.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [Sprites.SolarPanel1, Sprites.SolarPanel2],

  [EntityType.StarmapperStation]: [Sprites.StarmapperStation1, Sprites.StarmapperStation2, Sprites.StarmapperStation3],

  [EntityType.Hangar]: [Sprites.Hangar1],

  [EntityType.Garage]: [Sprites.Garage1, Sprites.Garage2],

  [EntityType.Workshop]: [Sprites.Workshop1, Sprites.Workshop2, Sprites.Workshop3],

  [EntityType.SAMLauncher]: [Sprites.SAMLauncher1, Sprites.SAMLauncher2, Sprites.SAMLauncher3],

  [EntityType.DroneFactory]: [Sprites.DroneFactory1],

  [EntityType.ShieldGenerator]: [Sprites.ShieldGenerator1, Sprites.ShieldGenerator2, Sprites.ShieldGenerator3],
  [EntityType.Vault]: [Sprites.Vault1, Sprites.Vault2, Sprites.Vault3],
  [EntityType.Market]: [Sprites.Market1],
  [EntityType.Shipyard]: [Sprites.Shipyard1],
  [EntityType.DroidBase]: [Sprites.DroidBase],
};

export const EntityTypeToAnimations: Record<string, (Animations | undefined)[]> = {
  [EntityType.MainBase]: [
    Animations.Mainbase1,
    Animations.Mainbase2,
    Animations.Mainbase3,
    Animations.Mainbase4,
    Animations.Mainbase5,
    Animations.Mainbase6,
    Animations.Mainbase7,
    Animations.Mainbase8,
  ],

  [EntityType.IronMine]: [Animations.IronMine1, Animations.IronMine2, Animations.IronMine3],
  [EntityType.CopperMine]: [Animations.CopperMine1, Animations.CopperMine2, Animations.CopperMine3],
  [EntityType.LithiumMine]: [Animations.LithiumMine1],

  [EntityType.KimberliteMine]: [Animations.KimberliteMine1, Animations.KimberliteMine2, Animations.KimberliteMine3],
  [EntityType.IridiumMine]: [Animations.IridiumMine1, Animations.IridiumMine2, Animations.IridiumMine3],
  [EntityType.PlatinumMine]: [Animations.PlatinumMine1, Animations.PlatinumMine2, Animations.PlatinumMine3],
  [EntityType.TitaniumMine]: [Animations.TitaniumMine1, Animations.TitaniumMine2, Animations.TitaniumMine3],

  [EntityType.StorageUnit]: [undefined, undefined, Animations.StorageUnit3],

  [EntityType.IronPlateFactory]: [Animations.IronPlateFactory1, Animations.IronPlateFactory2],

  [EntityType.AlloyFactory]: [Animations.AlloyFactory1, Animations.AlloyFactory2, Animations.AlloyFactory3],

  [EntityType.PVCellFactory]: [Animations.PhotovoltaicCellFactory1, Animations.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [Animations.SolarPanel1, Animations.SolarPanel2],

  [EntityType.StarmapperStation]: [
    Animations.StarmapperStation1,
    Animations.StarmapperStation2,
    Animations.StarmapperStation3,
  ],

  [EntityType.Hangar]: [Animations.Hangar1],

  [EntityType.Garage]: [Animations.Garage1, Animations.Garage2],

  [EntityType.Workshop]: [Animations.Workshop1, Animations.Workshop2, Animations.Workshop3],

  [EntityType.DroneFactory]: [Animations.DroneFactory1],

  [EntityType.SAMLauncher]: [Animations.SAMLauncher1, Animations.SAMLauncher2, Animations.SAMLauncher3],

  [EntityType.ShieldGenerator]: [Animations.ShieldGenerator1, Animations.ShieldGenerator2, Animations.ShieldGenerator3],

  [EntityType.Vault]: [Animations.Vault1, Animations.Vault2, Animations.Vault3],
  [EntityType.Market]: [Animations.Market1],
  [EntityType.Shipyard]: [Animations.Shipyard1],
  [EntityType.DroidBase]: [Animations.DroidBase],
  [EntityType.WormholeBase]: [Animations.WormholebaseIdle1],
};

export const MaxLevelToTilemap: Record<number, Tilemaps> = {
  1: Tilemaps.AsteroidMicro,
  3: Tilemaps.AsteroidSmall,
  6: Tilemaps.AsteroidMedium,
  8: Tilemaps.AsteroidLarge,
};

export const LevelToPrimaryAsteroidSprites = [
  Sprites.Asteroid1,
  Sprites.Asteroid2,
  Sprites.Asteroid3,
  Sprites.Asteroid4,
  Sprites.Asteroid5,
  Sprites.Asteroid6,
  Sprites.Asteroid7,
  Sprites.Asteroid8,
];

export const EntityTypeSizeToSecondaryAsteroidSprites: Record<Entity, Record<AsteroidSize, Sprites>> = {
  [EntityType.Kimberlite]: {
    Micro: Sprites.MotherlodeKimberliteSmall,
    Small: Sprites.MotherlodeKimberliteSmall,
    Medium: Sprites.MotherlodeKimberliteMedium,
    Large: Sprites.MotherlodeKimberliteLarge,
  },
  [EntityType.Iridium]: {
    Micro: Sprites.MotherlodeIridiumSmall,
    Small: Sprites.MotherlodeIridiumSmall,
    Medium: Sprites.MotherlodeIridiumMedium,
    Large: Sprites.MotherlodeIridiumLarge,
  },
  [EntityType.Platinum]: {
    Micro: Sprites.MotherlodePlatinumSmall,
    Small: Sprites.MotherlodePlatinumSmall,
    Medium: Sprites.MotherlodePlatinumMedium,
    Large: Sprites.MotherlodePlatinumLarge,
  },
  [EntityType.Titanium]: {
    Micro: Sprites.MotherlodeTitaniumSmall,
    Small: Sprites.MotherlodeTitaniumSmall,
    Medium: Sprites.MotherlodeTitaniumMedium,
    Large: Sprites.MotherlodeTitaniumLarge,
  },
  [EntityType.Common]: {
    Micro: Sprites.CommonMicro,
    Small: Sprites.CommonSmall,
    Medium: Sprites.CommonSmall,
    Large: Sprites.CommonSmall,
  },
  [EntityType.Wormhole]: {
    Micro: Sprites.Wormhole,
    Small: Sprites.Wormhole,
    Medium: Sprites.Wormhole,
    Large: Sprites.Wormhole,
  },
};

export const MaxLevelToAsteroidSpriteSize: Record<number, AsteroidSize> = {
  1: "Micro",
  2: "Micro",
  3: "Small",
  4: "Small",
  5: "Medium",
  6: "Medium",
  7: "Medium",
  8: "Large",
} as const;

export const RelationshipSizeToSecondaryAsteroidOutlineSprites: Record<Relationship, Record<AsteroidSize, Sprites>> = {
  Ally: {
    Micro: Sprites.MotherlodeAllianceSmall,
    Small: Sprites.MotherlodeAllianceSmall,
    Medium: Sprites.MotherlodeAllianceMedium,
    Large: Sprites.MotherlodeAllianceLarge,
  },
  Enemy: {
    Micro: Sprites.MotherlodeEnemySmall,
    Small: Sprites.MotherlodeEnemySmall,
    Medium: Sprites.MotherlodeEnemyMedium,
    Large: Sprites.MotherlodeEnemyLarge,
  },
  Neutral: {
    Micro: Sprites.MotherlodeNeutralSmall,
    Small: Sprites.MotherlodeNeutralSmall,
    Medium: Sprites.MotherlodeNeutralMedium,
    Large: Sprites.MotherlodeNeutralLarge,
  },
  Self: {
    Micro: Sprites.MotherlodePlayerSmall,
    Small: Sprites.MotherlodePlayerSmall,
    Medium: Sprites.MotherlodePlatinumMedium,
    Large: Sprites.MotherlodePlayerLarge,
  },
};

export const RelationshipToPrimaryAsteroidOutlineSprites: Record<Relationship, Sprites> = {
  ["Ally"]: Sprites.AsteroidAlliance,
  ["Neutral"]: Sprites.AsteroidPlayer,
  ["Enemy"]: Sprites.AsteroidEnemy,
  ["Self"]: Sprites.AsteroidPlayer,
};

export const ModeToSceneKey: Record<Entity, SceneKeys> = {
  [Mode.Asteroid]: "ASTEROID",
  [Mode.Starmap]: "STARMAP",
  [Mode.CommandCenter]: "COMMAND_CENTER",
  [Mode.Spectate]: "ASTEROID",
};

//index is level
export const MainbaseLevelToEmblem = [
  Sprites.Emblem1,
  Sprites.Emblem2,
  Sprites.Emblem3,
  Sprites.Emblem4,
  Sprites.Emblem5,
  Sprites.Emblem6,
  Sprites.Emblem7,
  Sprites.Emblem8,
];
