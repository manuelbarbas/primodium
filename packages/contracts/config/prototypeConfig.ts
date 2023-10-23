import { Hex } from "viem";
import { config } from "../mud.config";
import {
  encodeArray,
  getResourceValue,
  getResourceValues,
  idsToPrototypes,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/prototypeGenUtils";
import { PrototypesConfig } from "../ts/prototypes/types";
import { MUDEnums } from "./enums";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32 from "./util/encodeBytes32";

const mainBaseMaxResourceUpgrades = {
  1: { Iron: 300000, Copper: 300000, IronPlate: 200000 },
  2: { Iron: 500000, Copper: 500000, IronPlate: 300000, Lithium: 200000, Sulfur: 200000, PVCell: 100000 },
  3: {
    Iron: 1000000,
    Copper: 1000000,
    IronPlate: 500000,
    Lithium: 500000,
    Sulfur: 500000,
    PVCell: 200000,
    Alloy: 200000,
  },
  4: {
    Iron: 2000000,
    Copper: 2000000,
    Lithium: 1000000,
    IronPlate: 1000000,
    Sulfur: 1000000,
    PVCell: 500000,
    Alloy: 200000,
    Titanium: 100000,
    Platinum: 100000,
    Iridium: 100000,
    Kimberlite: 100000,
  },
  5: {
    Iron: 5000000,
    Copper: 5000000,
    IronPlate: 3000000,
    Lithium: 3000000,
    Sulfur: 3000000,
    PVCell: 1000000,
    Alloy: 500000,
    Titanium: 300000,
    Platinum: 300000,
    Iridium: 300000,
    Kimberlite: 300000,
  },
  6: {
    Iron: 10000000,
    Copper: 10000000,
    IronPlate: 5000000,
    Lithium: 5000000,
    Sulfur: 5000000,
    PVCell: 2000000,
    Alloy: 1000000,
    Titanium: 600000,
    Platinum: 600000,
    Iridium: 600000,
    Kimberlite: 600000,
  },
  7: {
    Iron: 25000000,
    Copper: 25000000,
    IronPlate: 10000000,
    Lithium: 10000000,
    Sulfur: 10000000,
    PVCell: 5000000,
    Alloy: 5000000,
    Titanium: 750000,
    Platinum: 750000,
    Iridium: 750000,
    Kimberlite: 750000,
  },
  8: {
    Iron: 50000000,
    Copper: 50000000,
    IronPlate: 25000000,
    Lithium: 25000000,
    Sulfur: 250000000,
    PVCell: 10000000,
    Alloy: 10000000,
    Titanium: 100000,
    Platinum: 100000,
    Iridium: 100000,
    Kimberlite: 100000,
  },
};

const storageUnitMaxResourceUpgrades = {
  1: { Iron: 100000, Copper: 100000, Lithium: 50000, Sulfur: 50000, IronPlate: 7200, PVCell: 50000, Alloy: 4500 },
  2: {
    Iron: 250000,
    Copper: 250000,
    Lithium: 100000,
    Sulfur: 100000,
    IronPlate: 100000,
    PVCell: 100000,
    Alloy: 100000,
    Titanium: 25000,
    Platinum: 25000,
    Iridium: 25000,
    Kimberlite: 25000,
  },
  3: {
    Iron: 500000,
    Copper: 500000,
    Lithium: 250000,
    Sulfur: 250000,
    IronPlate: 250000,
    PVCell: 250000,
    Alloy: 250000,
    Titanium: 50000,
    Platinum: 50000,
    Iridium: 50000,
    Kimberlite: 50000,
  },
  4: {
    Iron: 100000,
    Copper: 100000,
    Lithium: 500000,
    Sulfur: 500000,
    IronPlate: 500000,
    PVCell: 500000,
    Alloy: 500000,
    Titanium: 100000,
    Platinum: 100000,
    Iridium: 100000,
    Kimberlite: 100000,
  },
};

const maxRange = { xBounds: 37, yBounds: 25 };

export const prototypeConfig: PrototypesConfig<typeof config> = {
  /* ---------------------------------- World --------------------------------- */
  World: {
    keys: [],
    tables: {
      P_Asteroid: maxRange,
      P_GameConfig: {
        motherlodeDistance: 10n,
        maxMotherlodesPerAsteroid: 6n,
        motherlodeChanceInv: 4n,
        unitProductionRate: 100n,
        moveSpeed: 10000n,
        worldSpeed: 100n,
      },
      P_UnitPrototypes: {
        value: MUDEnums.EUnit.reduce(
          (prev: Hex[], unit) => (unit == "NULL" || unit == "LENGTH" ? prev : [...prev, encodeBytes32(unit)]),
          []
        ),
      },
    },
  },

  Building: {
    levels: idsToPrototypes(MUDEnums.EBuilding),
  },

  Expansion: {
    tables: {
      P_MaxLevel: { value: 7n },
    },
    levels: {
      1: { Dimensions: { width: 13, height: 11 }, P_RequiredBaseLevel: { value: 1n } },
      2: { Dimensions: { width: 17, height: 13 }, P_RequiredBaseLevel: { value: 2n } },
      3: { Dimensions: { width: 21, height: 15 }, P_RequiredBaseLevel: { value: 3n } },
      4: { Dimensions: { width: 25, height: 17 }, P_RequiredBaseLevel: { value: 4n } },
      5: { Dimensions: { width: 29, height: 19 }, P_RequiredBaseLevel: { value: 5n } },
      6: { Dimensions: { width: 33, height: 13 }, P_RequiredBaseLevel: { value: 6n } },
      7: { Dimensions: { width: maxRange.xBounds, height: maxRange.yBounds }, P_RequiredBaseLevel: { value: 7n } },
    },
  },

  /* -------------------------------- Buildings ------------------------------- 
   NOTE the key of a building prototype must match its EBuilding enum equivalent
   This is because we use the enum to look up the prototype in the P_BuildingTypeToPrototype table
  ----------------------------------------------------------------------------- */

  MainBase: {
    tables: {
      Position: {
        x: Math.floor(maxRange.xBounds / 2) + 1,
        y: Math.floor(maxRange.yBounds / 2) + 1,
        parent: encodeBytes32(0),
      },
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 8n },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[1]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      2: {
        P_RequiredResources: getResourceValues({ Copper: 1500000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[2]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      3: {
        P_RequiredResources: getResourceValues({ Copper: 300000, PVCell: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[3]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 700000, Alloy: 60000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[4]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 1000000, Titanium: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[5]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 2500000, Titanium: 150000, Platinum: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[6]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      7: {
        P_RequiredResources: getResourceValues({
          Copper: 7500000,
          Titanium: 250000,
          Platinum: 250000,
          Iridium: 250000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[7]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      8: {
        P_RequiredResources: getResourceValues({ Kimberlite: 500000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[8]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValue({ U_Vessel: 1, U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
    },
  },
  ...upgradesByLevel("MainBase", mainBaseMaxResourceUpgrades),

  // Mines
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValue({ Iron: 50 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Copper: 50000 }),
        P_Production: getResourceValue({ Iron: 65 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 500000 }),
        P_Production: getResourceValue({ Iron: 80 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 3000000 }),
        P_Production: getResourceValue({ Iron: 95 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 10000000 }),
        P_Production: getResourceValue({ Iron: 110 }),
      },
    },
  },
  CopperMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Copper") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 3500 }),
        P_Production: getResourceValue({ Copper: 30 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 50000, Copper: 15000 }),
        P_Production: getResourceValue({ Copper: 40 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 1500000, Copper: 500000 }),
        P_Production: getResourceValue({ Copper: 50 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 5000000, Copper: 1500000 }),
        P_Production: getResourceValue({ Copper: 60 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000000, Copper: 5000000 }),
        P_Production: getResourceValue({ Copper: 70 }),
      },
    },
  },
  LithiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Lithium") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValue({ Lithium: 20 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 2000000 }),
        P_Production: getResourceValue({ Lithium: 25 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 5000000 }),
        P_Production: getResourceValue({ Lithium: 30 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 7500000 }),
        P_Production: getResourceValue({ Lithium: 35 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 12500000 }),
        P_Production: getResourceValue({ Lithium: 40 }),
      },
    },
  },
  SulfurMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Sulfur") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 250000, U_Electricity: 50 }),
        P_Production: getResourceValue({ Sulfur: 10 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 1000000, Copper: 150000, U_Electricity: 75 }),
        P_Production: getResourceValue({ Sulfur: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2500000, Copper: 500000, U_Electricity: 100 }),
        P_Production: getResourceValue({ Sulfur: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 5000000, Copper: 1500000, U_Electricity: 125 }),
        P_Production: getResourceValue({ Sulfur: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000000, Copper: 5000000, U_Electricity: 150 }),
        P_Production: getResourceValue({ Sulfur: 20 }),
      },
    },
  },

  // Factories
  IronPlateFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 5n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 45000, Copper: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 35 }),
        P_Production: getResourceValue({ IronPlate: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 200000, Lithium: 75000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 45 }),
        P_Production: getResourceValue({ IronPlate: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 5000000, Lithium: 2500000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 55 }),
        P_Production: getResourceValue({ IronPlate: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 15000000, Lithium: 7500000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 65 }),
        P_Production: getResourceValue({ IronPlate: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 25000000, Titanium: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 75 }),
        P_Production: getResourceValue({ IronPlate: 20 }),
      },
    },
  },
  AlloyFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 500000, IronPlate: 50000, U_Electricity: 100 }),
        P_RequiredDependencies: getResourceValues({ Iron: 35, Copper: 20 }),
        P_Production: getResourceValue({ Alloy: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 5000000, IronPlate: 250000, U_Electricity: 120 }),
        P_RequiredDependencies: getResourceValues({ Iron: 50, Copper: 30 }),
        P_Production: getResourceValue({ Alloy: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 12500000, IronPlate: 1000000, U_Electricity: 150 }),
        P_RequiredDependencies: getResourceValues({ Iron: 60, Copper: 35 }),
        P_Production: getResourceValue({ Alloy: 9 }),
      },
    },
  },
  PVCellFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 150000, Lithium: 20000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 10, Copper: 20 }),
        P_Production: getResourceValue({ PVCell: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 350000, Lithium: 250000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 20, Copper: 30 }),
        P_Production: getResourceValue({ PVCell: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 750000, Lithium: 1000000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 25, Copper: 35 }),
        P_Production: getResourceValue({ PVCell: 9 }),
      },
    },
  },

  // Utilities
  StorageUnit: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 4n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 300000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 1000000, Copper: 1000000, Titanium: 10000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, Copper: 2000000, Iridium: 50000, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({
          Iron: 6000000,
          Copper: 600000,
          Kimberlite: 100000,
          U_Electricity: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[3]),
        },
      },
    },
  },
  ...upgradesByLevel("StorageUnit", storageUnitMaxResourceUpgrades),
  SolarPanel: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ PVCell: 2000, Iron: 40000 }),
        P_Production: getResourceValue({ U_Electricity: 300 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ PVCell: 400000, Copper: 500000 }),
        P_Production: getResourceValue({ U_Electricity: 600 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ PVCell: 500000, Copper: 1500000 }),
        P_Production: getResourceValue({ U_Electricity: 800 }),
      },
    },
  },

  // Units
  Garage: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 5n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 20000 }),
        P_Production: getResourceValue({ U_Housing: 40 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Sulfur: 50000, Copper: 200000 }),
        P_Production: getResourceValue({ U_Housing: 60 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 150000, Copper: 800000 }),
        P_Production: getResourceValue({ U_Housing: 80 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Copper: 200000 }),
        P_Production: getResourceValue({ U_Housing: 100 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Titanium: 50000 }),
        P_Production: getResourceValue({ U_Housing: 120 }),
      },
    },
  },
  Hangar: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 5n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 500000, Lithium: 150000, U_Electricity: 100 }),
        P_Production: getResourceValue({ U_Housing: 150 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Copper: 1750000, U_Electricity: 200 }),
        P_Production: getResourceValue({ U_Housing: 250 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Copper: 3000000, U_Electricity: 300 }),
        P_Production: getResourceValue({ U_Housing: 350 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Platinum: 75000, U_Electricity: 400 }),
        P_Production: getResourceValue({ U_Housing: 500 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 7500000, Kimberlite: 250000, U_Electricity: 500 }),
        P_Production: getResourceValue({ U_Housing: 600 }),
      },
    },
  },
  DroneFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 6n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Lithium: 200000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 200000, U_Electricity: 150 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Lithium: 750000, U_Electricity: 200 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Sulfur: 1500000, Platinum: 100000, U_Electricity: 300 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Iridium: 200000, U_Electricity: 400 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 7500000, Kimberlite: 100000, U_Electricity: 500 }),
        P_UnitProdMultiplier: { value: 180n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
    },
  },
  Workshop: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 4n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Copper: 25000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Sulfur: 50000, Copper: 250000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Copper: 200000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 2000000, Titanium: 10000, U_Electricity: 150 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
    },
  },
  Starmapper: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 2) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 10000 }),
        P_Production: getResourceValue({ U_MaxMoves: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 125000 }),
        P_Production: getResourceValue({ U_MaxMoves: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 125000, Kimberlite: 10000 }),
        P_Production: getResourceValue({ U_MaxMoves: 3 }),
      },
    },
  },

  // Defensive Buildings
  SAM: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Titanium: 70000, U_Electricity: 100 }),
        P_Production: getResourceValue({ U_MaxMoves: 1 }),
        // P_Defence: { value: 900n },
      },
      2: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 3000000, Platinum: 250000, U_Electricity: 150 }),
        P_Production: getResourceValue({ U_MaxMoves: 2 }),
        // P_Defence: { value: 900n },
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 7000000, Iridium: 100000, U_Electricity: 200 }),
        P_Production: getResourceValue({ U_MaxMoves: 3 }),
        // P_Defence: { value: 900n },
      },
    },
  },
  /* -------------------------------- Resources ------------------------------- */
  // NOTE: To check if a resource is a utility, call P_IsUtility(EResource.<resource>);
  IsUtility: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("U_Electricity")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Housing")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Vessel")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_MaxMoves")]: { P_IsUtility: { value: true } },
    },
  },

  /* --------------------------------- Units --------------------------------- */
  Unit: {
    levels: idsToPrototypes(MUDEnums.EUnit),
  },

  AnvilDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 40n,
          defense: 150n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 30000 }),
        P_RequiredBaseLevel: { value: 4n },

        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 42n,
          defense: 157n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 44n,
          defense: 165n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 46n,
          defense: 172n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 160000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 48n,
          defense: 180n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 2 }),
        P_Unit: {
          attack: 50n,
          defense: 187n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
    },
  },
  AegisDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 150n,
          defense: 400n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 157n,
          defense: 420n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 165n,
          defense: 440n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 172n,
          defense: 460n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 160000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 180n,
          defense: 480n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 3 }),
        P_Unit: {
          attack: 187n,
          defense: 500n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
    },
  },
  HammerDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 140n,
          defense: 50n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 147n,
          defense: 52n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 154n,
          defense: 55n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 100000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 161n,
          defense: 57n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 160000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 168n,
          defense: 60n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 1 }),
        P_Unit: {
          attack: 174n,
          defense: 62n,
          cargo: 7000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
    },
  },
  StingerDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 550n,
          defense: 150n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 587n,
          defense: 157n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 625n,
          defense: 165n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 662n,
          defense: 172n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 160000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 700n,
          defense: 180n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 737n,
          defense: 187n,
          cargo: 30000n,
          speed: 10n,
          trainingTime: 200n,
        },
      },
    },
  },
  MiningVessel: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 20n,
          defense: 500n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 50000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 2n },
        P_Unit: {
          attack: 25n,
          defense: 550n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 50000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 3n },
        P_Unit: {
          attack: 35n,
          defense: 600n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 50000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 4n },
        P_Unit: {
          attack: 45n,
          defense: 650n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 20000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 5n },
        P_Unit: {
          attack: 55n,
          defense: 700n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 50000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, IronPlate: 200000, PVCell: 15000, U_Vessel: 1 }),
        P_MiningRate: { value: 6n },
        P_Unit: {
          attack: 55n,
          defense: 750n,
          cargo: 100000n,
          speed: 16n,
          trainingTime: 1000n,
        },
      },
    },
  },
  MinutemanMarine: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 40n,
          defense: 20n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Sulfur: 500000, Iron: 500000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 2n },
        P_Unit: {
          attack: 42n,
          defense: 21n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Sulfur: 5000000, Iron: 5000000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 3n },
        P_Unit: {
          attack: 44n,
          defense: 23n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Sulfur: 10000000, Iron: 10000000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 4n },
        P_Unit: {
          attack: 46n,
          defense: 25n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Sulfur: 25000000, Iron: 25000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 5n },
        P_Unit: {
          attack: 48n,
          defense: 27n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Sulfur: 50000000, Iron: 50000000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 1 }),
        P_MiningRate: { value: 6n },
        P_Unit: {
          attack: 50n,
          defense: 30n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 20n,
        },
      },
    },
  },
  TridentMarine: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 80n,
          defense: 150n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 500000, IronPlate: 5000000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 2n },
        P_Unit: {
          attack: 84n,
          defense: 157n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 5000000, IronPlate: 50000000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 3n },
        P_Unit: {
          attack: 90n,
          defense: 165n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 10000000, IronPlate: 10000000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 4n },
        P_Unit: {
          attack: 95n,
          defense: 172n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 25000000, IronPlate: 25000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 5n },
        P_Unit: {
          attack: 100n,
          defense: 180n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 50000000, IronPlate: 5000000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Housing: 1 }),
        P_MiningRate: { value: 6n },
        P_Unit: {
          attack: 110n,
          defense: 187n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
    },
  },

  Iron: {
    tables: {
      P_ScoreMultiplier: { value: 10n },
    },
  },
  Copper: {
    tables: {
      P_ScoreMultiplier: { value: 15n },
    },
  },
  Lithium: {
    tables: {
      P_ScoreMultiplier: { value: 20n },
    },
  },
  Sulfur: {
    tables: {
      P_ScoreMultiplier: { value: 30n },
    },
  },
  Titanium: {
    tables: {
      P_ScoreMultiplier: { value: 100n },
    },
  },
  Iridium: {
    tables: {
      P_ScoreMultiplier: { value: 200n },
    },
  },
  Osmium: {
    tables: {
      P_ScoreMultiplier: { value: 300n },
    },
  },
  Tungsten: {
    tables: {
      P_ScoreMultiplier: { value: 400n },
    },
  },
  Kimberlite: {
    tables: {
      P_ScoreMultiplier: { value: 1000n },
    },
  },
  Platinum: {
    tables: {
      P_ScoreMultiplier: { value: 1500n },
    },
  },
  Uraninite: {
    tables: {
      P_ScoreMultiplier: { value: 2000n },
    },
  },
  Bolutite: {
    tables: {
      P_ScoreMultiplier: { value: 2500n },
    },
  },
  IronPlate: {
    tables: {
      P_ScoreMultiplier: { value: 30n },
    },
  },
  PVCell: {
    tables: {
      P_ScoreMultiplier: { value: 60n },
    },
  },
  Alloy: {
    tables: {
      P_ScoreMultiplier: { value: 100n },
    },
  },
  RocketFuel: {
    tables: {
      P_ScoreMultiplier: { value: 200n },
    },
  },
  Objectives: {
    levels: idsToPrototypes(MUDEnums.EObjectives),
  },
};
