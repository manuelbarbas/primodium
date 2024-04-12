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

export enum EObjectives {
  BuildIronMine = 1,
  BuildCopperMine,
  BuildGarage,
  BuildWorkshop,

  UpgradeMainBase,

  BuildLithiumMine,
  BuildIronPlateFactory,
  BuildStorageUnit,
  BuildHangar,
  BuildPVCellFactory,
  BuildSolarPanel,
  BuildDroneFactory,
  BuildStarmapper,
  BuildSAMLauncher,
  BuildVault,
  BuildShieldGenerator,
  BuildShipyard,
  BuildMarket,

  TrainMinutemanMarine1,
  TrainTridentMarine1,
  TrainLightningShip1,
  TrainAnvilDrone1,
  TrainHammerDrone1,
  TrainAegisDrone1,
  TrainStingerDrone1,
  BuildColonyShip1,

  ExpandBase1,

  CreateFleet,
  TransferResourcesToAsteroid,
  TransferResourcesToFleet,
  RecallFleet,
  LandFleet,
  MoveFleet,
  BattleAsteroid,
  BattleFleet,
  SuccessfulRaid,
  OpenBattleReport,
  UpgradeUnitType,
  BuildColonyShip,
  DecryptAttack,
  CaptureAsteroid,

  MarketSwap,
  MarketLiquidity,

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
  EObjectives: enumToArray(EObjectives),
  EAllianceInviteMode: enumToArray(EAllianceInviteMode),
  EAllianceRole: enumToArray(EAllianceRole),
  EFleetStance: enumToArray(EFleetStance),
  EScoreType: enumToArray(EScoreType),
};

function enumToArray(enumObj: object): string[] {
  return ["NULL", ...Object.keys(enumObj).filter((key) => isNaN(Number(key))), "LENGTH"];
}
