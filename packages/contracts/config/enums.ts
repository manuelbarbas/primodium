export enum ERock {
  Asteroid = 1,
  Motherlode,
}

export enum EBuilding {
  MainBase = 1,

  // Mines
  LithiumMine,
  IronMine,
  CopperMine,
  SulfurMine,

  // Factories
  IronPlateFactory,
  AlloyFactory,
  PVCellFactory,
  RocketFuelFactory,

  // Utilities
  SolarPanel,

  // Units
  Hangar,
  UnitTrainingBuilding,
  StorageUnit,
  DroneFactory,
  Starmapper,
}

export enum EResource {
  Sandstone = 1,
  Biofilm,
  Alluvium,
  Regolith,
  Bedrock,
  Water,
  Lithium,
  Iron,
  Copper,
  Sulfur,
  Titanium,
  Iridium,
  Osmium,
  Tungsten,
  Kimberlite,
  Platinum,
  Uraninite,
  Bolutite,

  // Crafted Items
  IronPlate,
  Alloy,
  PVCell,
  RocketFuel,

  // Utilities
  U_Electricity,
  U_Housing,
  U_Vessel,
  U_MaxMoves,
}

export enum ESize {
  Small = 1,
  Medium,
  Large,
}

export enum EUnit {
  MiningVessel = 1,
  AegisDrone,
  HammerDrone,
  StingerDrone,
  AnvilDrone,
}

export enum ESendType {
  Reinforce = 1,
  Invade,
  Raid,
}

export const MUDEnums = {
  ERock: enumToArray(ERock),
  EBuilding: enumToArray(EBuilding),
  EResource: enumToArray(EResource),
  ESize: enumToArray(ESize),
  EUnit: enumToArray(EUnit),
  ESendType: enumToArray(ESendType),
};

function enumToArray(enumObj: object): string[] {
  return ["NULL", ...Object.keys(enumObj).filter((key) => isNaN(Number(key))), "LENGTH"];
}
