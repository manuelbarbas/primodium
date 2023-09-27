export const MUDEnums = {
  ERock: ["NULL", "Asteroid", "Motherlode", "LENGTH"],
  EBuilding: [
    "NULL",
    // Special
    "MainBase",

    // Mines
    "LithiumMine",
    "IronMine",
    "CopperMine",
    "SulfurMine",

    // Factories
    "IronPlateFactory",
    "AlloyFactory",
    "PVCellFactory",
    "RocketFuelFactory",

    // Utilities
    "SolarPanel",

    // Units
    "Hangar",
    "UnitTrainingBuilding",
    "StorageUnit",
    "DroneFactory",
    "Starmapper",
    "LENGTH",
  ],

  EResource: [
    "NULL",
    "Sandstone",
    "Biofilm",
    "Alluvium",
    "Regolith",
    "Bedrock",
    "Water",
    "Lithium",
    "Iron",
    "Copper",
    "Sulfur",
    "Titanium",
    "Iridium",
    "Osmium",
    "Tungsten",
    "Kimberlite",
    "Platinum",
    "Uraninite",
    "Bolutite",

    // Crafted Items
    "IronPlate",
    "Alloy",
    "PVCell",
    "RocketFuel",

    // Utilities
    "U_Electricity",
    "U_Housing",
    "U_Vessel",
    "U_MaxMoves",

    "LENGTH",
  ],

  ESize: ["NULL", "Small", "Medium", "Large", "LENGTH"],

  EUnit: ["NULL", "MiningVessel", "AegisDrone", "HammerDrone", "StingerDrone", "AnvilDrone", "LENGTH"],
  ESendType: ["NULL", "Reinforce", "Invade", "Raid", "LENGTH"],
};
