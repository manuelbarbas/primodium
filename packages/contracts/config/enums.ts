export enum EBuilding {
  MainBase = 1,

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
  U_CapitalShipCapacity,
  U_MaxFleets,
  U_Defense,
  U_Unraidable,
  U_AdvancedUnraidable,
  R_HP,
  R_Encryption,

  // Multipliers
  M_DefenseMultiplier,
}

export enum ESize {
  Small = 1,
  Medium,
  Large,
}

export enum EUnit {
  AegisDrone = 1,
  AnvilDrone,
  StingerDrone,
  HammerDrone,
  MinutemanMarine,
  TridentMarine,
  LightningCraft,
  CapitalShip,
  Droid,
}

export enum ESendType {
  Reinforce = 1,
  Invade,
  Raid,
  Recall,
}

export enum EOrderType {
  Resource = 1,
  Unit,
}

export enum EObjectives {
  BuildIronMine = 1,
  BuildCopperMine,
  BuildGarage,
  DefeatPirateBase1,
  BuildWorkshop,

  UpgradeMainBase,

  BuildLithiumMine,
  BuildIronPlateFactory,
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
  BuildCapitalShip1,

  ExpandBase1,
}

export enum EFleetKey {
  OwnedBy = 1,
  Incoming = 2,
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

export const MUDEnums = {
  EBuilding: enumToArray(EBuilding),
  EResource: enumToArray(EResource),
  ESize: enumToArray(ESize),
  EUnit: enumToArray(EUnit),
  ESendType: enumToArray(ESendType),
  EObjectives: enumToArray(EObjectives),
  EAllianceInviteMode: enumToArray(EAllianceInviteMode),
  EAllianceRole: enumToArray(EAllianceRole),
  EOrderType: enumToArray(EOrderType),
  EFleetKey: enumToArray(EFleetKey),
  EFleetStance: enumToArray(EFleetStance),
};

function enumToArray(enumObj: object): string[] {
  return ["NULL", ...Object.keys(enumObj).filter((key) => isNaN(Number(key))), "LENGTH"];
}
