export enum EBuilding {
  MainBase = 1,
  WormholeBase,

  // Mines
  LithiumMine,
  IronMine,
  CopperMine,

  KimberliteMine,
  IridiumMine,
  TitaniumMine,
  PlatinumMine,

  // Factories
  IronPlateFactory,
  AlloyFactory,
  PVCellFactory,

  // Utilities
  SolarPanel,

  // Units
  Hangar,
  Garage,
  StorageUnit,
  Workshop,
  DroneFactory,
  Starmapper,
  SAM,

  ShieldGenerator,
  Vault,
  Market,

  Shipyard,
}

export enum EResource {
  Iron = 1,
  Copper,
  Lithium,

  Titanium,
  Iridium,
  Kimberlite,
  Platinum,

  // Crafted Items
  IronPlate,
  Alloy,
  PVCell,

  // Utilities
  U_Electricity,
  U_Housing,
  U_MaxFleets,
  U_Defense,
  U_Unraidable,
  U_AdvancedUnraidable,
  R_HP,
  R_Encryption,

  // Multipliers
  M_DefenseMultiplier,
}

export enum EUnit {
  AegisDrone = 1,
  AnvilDrone,
  StingerDrone,
  HammerDrone,
  MinutemanMarine,
  TridentMarine,
  LightningCraft,
  ColonyShip,
  Droid,
}

export enum EMap {
  Primary = 1,
  Kimberlite = 2,
  Iridium = 3,
  Platinum = 4,
  Titanium = 5,
  Wormhole = 6,
  Common = 7,
}

export enum EObjectives {
  // (A) Fundamentals
  BuildIronMine = 1,
  BuildCopperMine,
  BuildLithiumMine,

  UpgradeMainBase1,
  UpgradeMainBase2,

  ExpandBase1,
  ExpandBase2,

  UpgradeIronMine1,
  UpgradeIronMine2,

  UpgradeCopperMine1,
  UpgradeCopperMine2,

  UpgradeLithiumMine1,
  UpgradeLithiumMine2,

  // (A-A) Military basics
  BuildGarage,
  UpgradeGarage,
  BuildWorkshop,
  UpgradeWorkshop,

  // (A-A-A) Fleet basics
  CreateFleet,
  TransferFromAsteroid,
  TransferFromFleet,
  SendFleet,

  // (A-A-A-A) Fleet combat
  BattleAsteroid,
  OpenBattleReport,
  BattleFleet,

  // (A-A-A-B) Conquest (cont)
  BuildShipyard,
  TrainColonyShip,
  DecryptAttack,
  CaptureAsteroid,

  // (A-A-A-B-A) Motherlode Extraction
  CaptureMotherlodeAsteroid,
  BuildRareMine,

  // (A-A-A-B-B) Victory: Primodium Points
  EarnPrimodiumOnAsteroid,
  CaptureVolatileShard,
  ExplodeVolatileShard,

  // (A-A-A-B-C) Victory; Extraction Points
  CaptureWormholeAsteroid,
  TeleportResources,

  // (A-A-A-C) fleet management
  BuildStarmapper,
  DefendWithFleet,
  BlockWithFleet,
  LandFleet,

  // (A-A-B) unit production
  TrainMinutemanMarine,
  TrainTridentMarine,
  TrainLightningCraft,

  // (A-A-B-A) unit management
  UpgradeUnit,

  // (A-A-B-B) unit production (cont)
  BuildDroneFactory,
  TrainAnvilDrone,
  TrainHammerDrone,
  TrainAegisDrone,
  TrainStingerDrone,

  // (A-A-B-C) unit storage
  BuildHangar,

  // (A-A-C) Defense
  BuildShieldGenerator,
  BuildVault,
  BuildSAMLauncher,

  // (A-B) Production
  BuildStorageUnit,
  UpgradeStorageUnit1,
  BuildIronPlateFactory,
  BuildAlloyFactory,
  BuildPVCellFactory,

  // (A-B-A) Production (cont)
  BuildSolarPanel,

  // (A-B-B) Market
  BuildMarket,
  MarketSwap,

  // (A-C) Alliance
  JoinAlliance,
}

export enum EAllianceInviteMode {
  Open = 1,
  Closed,
}

export enum EAllianceRole {
  Owner = 1, // has all access
  CanGrantRole, //can grant roles except the grant role role
  CanKick, // can invite and kick members
  CanInvite, //can only invite members
  Member, // simple member with no special access
}

export enum EFleetStance {
  Follow = 1,
  Defend,
  Block,
}

export enum EScoreType {
  Primodium = 1,
  Wormhole,
}

export const MUDEnums = {
  EBuilding: enumToArray(EBuilding),
  EResource: enumToArray(EResource),
  EUnit: enumToArray(EUnit),
  EMap: enumToArray(EMap),
  EObjectives: enumToArray(EObjectives),
  EAllianceInviteMode: enumToArray(EAllianceInviteMode),
  EAllianceRole: enumToArray(EAllianceRole),
  EFleetStance: enumToArray(EFleetStance),
  EScoreType: enumToArray(EScoreType),
};

function enumToArray(enumObj: object): string[] {
  return ["NULL", ...Object.keys(enumObj).filter((key) => isNaN(Number(key))), "LENGTH"];
}
