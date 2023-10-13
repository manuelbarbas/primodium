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

export enum EPirateAsteroid {
  FirstPirateAsteroid,
  SecondPirateAsteroid,
  ThirdPirateAsteroid,
  FourthPirateAsteroid,
  FifthPirateAsteroid,
  SixthPirateAsteroid,
  SeventhPirateAsteroid,
}

export enum EObjectives {
  BuildFirstIronMine,
  BuildFirstCopperMine,
  BuildFirstLithiumMine,
  BuildFirstSulfurMine,
  BuildFirstIronPlateFactory,
  BuildFirstAlloyFactory,
  BuildFirstPVCellFactory,
  BuildGarage,
  BuildWorkshop,
  BuildSolarPanel,
  BuildDroneFactory,
  BuildHangar,
  TrainMinutemanMarine,
  TrainMinutemanMarine2,
  TrainMinutemanMarineI3D,
  TrainTridentMarine,
  TrainTridentMarine2,
  TrainTridentMarineI3D,
  TrainAnvilDrone,
  TrainAnvilDrone2,
  TrainAnvilDrone3,
  DefeatFirstPirateBase,
  DefeatSecondPirateBase,
  DefeatThirdPirateBase,
  DefeatFourthPirateBase,
  DefeatFifthPirateBase,
  DefeatSixthPirateBase,
  DefeatSeventhPirateBase,
  DefeatEighthPirateBase,
  DefeatNinthPirateBase,
  DefeatTenthPirateBase,
  DefeatEleventhPirateBase,
  ExpandBase,
  ExpandBase2,
  ExpandBase3,
  ExpandBase4,
  ExpandBase5,
  ExpandBase6,
  RaiseIronPlateProduction,
  MineTitanium1,
  MineTitanium2,
  MineTitanium3,
  MinePlatinum1,
  MinePlatinum2,
  MinePlatinum3,
  MineIridium1,
  MineIridium2,
  MineIridium3,
  MineKimberlite1,
  MineKimberlite2,
  MineKimberlite3,
  TrainHammerDrone,
  TrainHammerDrone2,
  TrainHammerDrone3,
  TrainAegisDrone,
  TrainAegisDrone2,
  TrainAegisDrone3,
  TrainStingerDrone,
  TrainStingerDrone2,
  TrainStingerDrone3,
  RaidRawResources,
  RaidRawResources2,
  RaidRawResources3,
  RaidFactoryResources,
  RaidFactoryResources2,
  RaidFactoryResources3,
  RaidMotherlodeResources,
  RaidMotherlodeResources2,
  RaidMotherlodeResources3,
  DestroyEnemyUnits,
  DestroyEnemyUnits2,
  DestroyEnemyUnits3,
  DestroyEnemyUnits4,
  DestroyEnemyUnits5,
  UpgradeMainBase,
  CommissionMiningVessel,
  BuildStarmap,
  BuildSAMLauncher,
}

export const MUDEnums = {
  ERock: enumToArray(ERock),
  EBuilding: enumToArray(EBuilding),
  EResource: enumToArray(EResource),
  ESize: enumToArray(ESize),
  EUnit: enumToArray(EUnit),
  ESendType: enumToArray(ESendType),
  EObjectives: enumToArray(EObjectives),
  EPirateAsteroid: enumToArray(EPirateAsteroid),
};

function enumToArray(enumObj: object): string[] {
  return ["NULL", ...Object.keys(enumObj).filter((key) => isNaN(Number(key))), "LENGTH"];
}
