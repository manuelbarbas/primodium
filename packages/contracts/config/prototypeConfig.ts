import { config } from "../mud.config";
import {
  getResourceValue,
  getResourceValues,
  idsToPrototypes,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/commands/maxResourceUpgrades";
import { PrototypesConfig } from "../ts/prototypes/types";
import { MUDEnums } from "./enums";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32 from "./util/encodeBytes32";

const mainBaseMaxResourceUpgrades = {
  1: { Iron: 175000, Copper: 135000, Lithium: 54000, IronPlate: 30000 },
  2: { Iron: 540000, Copper: 270000, Lithium: 100000, IronPlate: 70000, PVCell: 27000 },
  3: { Iron: 1440000, Copper: 720000, Sulfur: 144000, IronPlate: 155200, Alloy: 72000, PVCell: 50000 },
  4: {
    Iron: 3600000,
    Copper: 1800000,
    Lithium: 720000,
    Sulfur: 360000,
    IronPlate: 288000,
    Alloy: 180000,
    PVCell: 108000,
    Titanium: 100000,
    Platinum: 40000,
    Iridium: 25000,
    Kimberlite: 10000,
  },
  5: {
    Iron: 5760000,
    Copper: 2880000,
    Lithium: 1152000,
    Sulfur: 576000,
    IronPlate: 460800,
    Alloy: 300000,
    PVCell: 300000,
    Titanium: 300000,
    Platinum: 300000,
    Iridium: 200000,
    Kimberlite: 100000,
  },
  6: {
    Iron: 8640000,
    Copper: 4320000,
    Lithium: 1728000,
    Sulfur: 864000,
    IronPlate: 691200,
    Alloy: 600000,
    PVCell: 600000,
    Titanium: 600000,
    Platinum: 600000,
    Iridium: 600000,
    Kimberlite: 250000,
  },
  7: {
    Iron: 17280000,
    Copper: 8640000,
    Lithium: 3456000,
    Sulfur: 1728000,
    IronPlate: 1382000,
    Alloy: 864000,
    PVCell: 700000,
    Titanium: 700000,
    Platinum: 700000,
    Iridium: 700000,
    Kimberlite: 700000,
  },
  8: {
    Iron: 34560000,
    Copper: 17280000,
    Lithium: 6912000,
    Sulfur: 3456000,
    IronPlate: 2764000,
    Alloy: 1728000,
    PVCell: 1036800,
    Titanium: 800000,
    Platinum: 800000,
    Iridium: 800000,
    Kimberlite: 800000,
  },
};

const storageUnitMaxResourceUpgrades = {
  1: { Iron: 90000, Copper: 45000, Lithium: 18000, IronPlate: 7200, Alloy: 4500 },
  2: {
    Iron: 360000,
    Copper: 180000,
    Lithium: 72000,
    IronPlate: 28800,
    Alloy: 18000,
    Sulfur: 36000,
    PVCell: 10800,
    Titanium: 10000,
    Platinum: 10000,
  },
  3: {
    Iron: 720000,
    Copper: 360000,
    Lithium: 144000,
    IronPlate: 57600,
    Alloy: 36000,
    Sulfur: 72000,
    PVCell: 21600,
    Titanium: 20000,
    Platinum: 20000,
    Iridium: 10000,
  },
};

const maxRange = { xBounds: 37, yBounds: 25 };

export const prototypeConfig: PrototypesConfig<typeof config> = {
  /* ---------------------------------- World --------------------------------- */
  World: {
    keys: [],
    tables: {
      P_Asteroid: maxRange,
    },
  },

  Building: {
    levels: idsToPrototypes(MUDEnums.EBuilding),
  },

  Expansion: {
    tables: {
      P_MaxLevel: { value: 6 },
    },
    levels: {
      1: { Dimensions: { x: 13, y: 11 }, P_RequiredBaseLevel: { value: 1 } },
      2: { Dimensions: { x: 17, y: 13 }, P_RequiredBaseLevel: { value: 2 } },
      3: { Dimensions: { x: 21, y: 15 }, P_RequiredBaseLevel: { value: 3 } },
      4: { Dimensions: { x: 25, y: 17 }, P_RequiredBaseLevel: { value: 4 } },
      5: { Dimensions: { x: 29, y: 19 }, P_RequiredBaseLevel: { value: 5 } },
      6: { Dimensions: { x: 33, y: 13 }, P_RequiredBaseLevel: { value: 6 } },
      7: { Dimensions: { x: maxRange.xBounds, y: maxRange.yBounds }, P_RequiredBaseLevel: { value: 7 } },
    },
  },

  /* -------------------------------- Buildings ------------------------------- 
   NOTE the key of a building prototype must match its EBuilding enum equivalent
   This is because we use the enum to look up the prototype in the P_BuildingTypeToPrototype table
  ----------------------------------------------------------------------------- */

  MainBase: {
    tables: {
      Position: { x: Math.floor(maxRange.xBounds / 2), y: Math.floor(maxRange.yBounds / 2), parent: encodeBytes32(0) },
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 8 },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[1]),
        },
      },
      2: {
        P_RequiredResources: getResourceValues({ IronPlate: 6000, Copper: 10000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[2]),
        },
      },
      3: {
        P_RequiredResources: getResourceValues({ Sulfur: 12000, PVCell: 6000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[3]),
        },
      },
      4: {
        P_RequiredResources: getResourceValues({ Alloy: 10000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[4]),
        },
      },
      5: {
        P_RequiredResources: getResourceValues({ Titanium: 80000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[5]),
        },
      },
      6: {
        P_RequiredResources: getResourceValues({ Platinum: 250000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[6]),
        },
      },
      7: {
        P_RequiredResources: getResourceValues({ Iridium: 420000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[7]),
        },
      },
      8: {
        P_RequiredResources: getResourceValues({ Kimberlite: 590000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[8]),
        },
      },
    },
  },
  ...upgradesByLevel("MainBase", mainBaseMaxResourceUpgrades),

  // Mines
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1 }, P_Production: getResourceValue({ Iron: 50 }) },
      2: {
        P_RequiredBaseLevel: { value: 1 },
        P_RequiredResources: getResourceValues({ Copper: 10000 }),
        P_Production: getResourceValue({ Iron: 65 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3 },
        P_RequiredResources: getResourceValues({ Copper: 5000 }),
        P_Production: getResourceValue({ Iron: 80 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 5 },
        P_RequiredResources: getResourceValues({ Copper: 300000 }),
        P_Production: getResourceValue({ Iron: 95 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Copper: 300000 }),
        P_Production: getResourceValue({ Iron: 110 }),
      },
    },
  },
  CopperMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Copper") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1 },
        P_RequiredResources: getResourceValues({ Iron: 1500 }),
        P_Production: getResourceValue({ Copper: 30 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 10000, Copper: 5000 }),
        P_Production: getResourceValue({ Copper: 40 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Iron: 150000, Copper: 50000 }),
        P_Production: getResourceValue({ Copper: 50 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Iron: 500000, Copper: 150000 }),
        P_Production: getResourceValue({ Copper: 60 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Iron: 1000000, Copper: 500000 }),
        P_Production: getResourceValue({ Copper: 70 }),
      },
    },
  },
  LithiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Lithium") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 20000 }),
        P_Production: getResourceValue({ Lithium: 20 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Copper: 100000 }),
        P_Production: getResourceValue({ Lithium: 25 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Copper: 250000 }),
        P_Production: getResourceValue({ Lithium: 30 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7 },
        P_RequiredResources: getResourceValues({ Copper: 750000 }),
        P_Production: getResourceValue({ Lithium: 35 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Copper: 1250000 }),
        P_Production: getResourceValue({ Lithium: 40 }),
      },
    },
  },
  SulfurMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Sulfur") },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 25000 }),
        P_Production: getResourceValue({ Sulfur: 10 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Iron: 100000, Copper: 15000 }),
        P_Production: getResourceValue({ Sulfur: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Iron: 250000, Copper: 50000 }),
        P_Production: getResourceValue({ Sulfur: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7 },
        P_RequiredResources: getResourceValues({ Iron: 500000, Copper: 150000 }),
        P_Production: getResourceValue({ Sulfur: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Iron: 1000000, Copper: 500000 }),
        P_Production: getResourceValue({ Sulfur: 20 }),
      },
    },
  },

  // Factories
  IronPlateFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1 },
        P_RequiredResources: getResourceValues({ Iron: 40000, Copper: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 35 }),
        P_Production: getResourceValue({ IronPlate: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3 },
        P_RequiredResources: getResourceValues({ Copper: 100000, Lithium: 75000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 45 }),
        P_Production: getResourceValue({ IronPlate: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5 },
        P_RequiredResources: getResourceValues({ Copper: 500000, Lithium: 250000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 55 }),
        P_Production: getResourceValue({ IronPlate: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7 },
        P_RequiredResources: getResourceValues({ Copper: 1500000, Titanium: 7000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 65 }),
        P_Production: getResourceValue({ IronPlate: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Copper: 2500000, Kimberlite: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 65 }),
        P_Production: getResourceValue({ IronPlate: 20 }),
      },
    },
  },
  AlloyFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3 },
        P_RequiredResources: getResourceValues({ Iron: 50000, IronPlate: 50000, U_Electricity: 100 }),
        P_RequiredDependencies: getResourceValues({ Iron: 35, Copper: 20 }),
        P_Production: getResourceValue({ Alloy: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Copper: 500000, IronPlate: 25000, U_Electricity: 120 }),
        P_RequiredDependencies: getResourceValues({ Iron: 50, Copper: 30 }),
        P_Production: getResourceValue({ Alloy: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Copper: 1250000, IronPlate: 100000, U_Electricity: 150 }),
        P_RequiredDependencies: getResourceValues({ Iron: 60, Copper: 35 }),
        P_Production: getResourceValue({ Alloy: 9 }),
      },
    },
  },
  PVCellFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 25000, Lithium: 5000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 10, Copper: 20 }),
        P_Production: getResourceValue({ PVCell: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5 },
        P_RequiredResources: getResourceValues({ Copper: 350000, Lithium: 25000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 20, Copper: 30 }),
        P_Production: getResourceValue({ PVCell: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Copper: 750000, Lithium: 100000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 25, Copper: 35 }),
        P_Production: getResourceValue({ PVCell: 9 }),
      },
    },
  },

  // Utilities
  StorageUnit: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Iron: 100000, Copper: 100000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Iron: 500000, Titanium: 1000, U_Electricity: 50 }),
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
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ PVCell: 2000, Iron: 40000 }),
        P_Production: getResourceValue({ U_Electricity: 300 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ PVCell: 40000, Copper: 50000 }),
        P_Production: getResourceValue({ U_Electricity: 600 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ PVCell: 150000, Copper: 150000 }),
        P_Production: getResourceValue({ U_Electricity: 800 }),
      },
    },
  },

  // Units
  Hangar: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Iron: 20000, Lithium: 15000, U_Electricity: 100 }),
        P_Production: getResourceValue({ U_Housing: 100 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Sulfur: 5000, Copper: 175000, U_Electricity: 200 }),
        P_Production: getResourceValue({ U_Housing: 250 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Sulfur: 15000, Copper: 300000, U_Electricity: 300 }),
        P_Production: getResourceValue({ U_Housing: 350 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7 },
        P_RequiredResources: getResourceValues({ Sulfur: 50000, Platinum: 10000, U_Electricity: 400 }),
        P_Production: getResourceValue({ U_Housing: 500 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Kimberlite: 15000, U_Electricity: 500 }),
        P_Production: getResourceValue({ U_Housing: 600 }),
      },
    },
  },
  DroneFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 4 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2 },
        P_RequiredResources: getResourceValues({ Lithium: 5000, U_Electricity: 100 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4 },
        P_RequiredResources: getResourceValues({ Sulfur: 25000, U_Electricity: 200 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6 },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Iridium: 20000, U_Electricity: 350 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Sulfur: 275000, Kimberlite: 10000, U_Electricity: 500 }),
      },
    },
  },
  Starmapper: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3 },
        P_RequiredResources: getResourceValues({ Sulfur: 10000 }),
        P_Production: getResourceValue({ U_MoveCount: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7 },
        P_RequiredResources: getResourceValues({ Sulfur: 125000 }),
        P_Production: getResourceValue({ U_MoveCount: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8 },
        P_RequiredResources: getResourceValues({ Sulfur: 125000, Kimberlite: 10000 }),
        P_Production: getResourceValue({ U_MoveCount: 3 }),
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
      [MUDEnums.EResource.indexOf("U_MoveCount")]: { P_IsUtility: { value: true } },
    },
  },
};
