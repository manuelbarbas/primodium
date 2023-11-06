import { Hex } from "viem";
import { config } from "../mud.config";
import {
  encodeArray,
  getResourceValues,
  getUnitValues,
  idsToPrototypes,
  indexifyResourceArray,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/prototypeGenUtils";
import { PrototypesConfig } from "../ts/prototypes/types";
import { EResource, MUDEnums } from "./enums";
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
    Titanium: 50000,
    Platinum: 50000,
    Iridium: 50000,
    Kimberlite: 50000,
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
    Titanium: 1000000,
    Platinum: 1000000,
    Iridium: 1000000,
    Kimberlite: 1000000,
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
      P_AllianceConfig: { maxAllianceMembers: 20n },
      P_GracePeriod: { value: 60n * 60n * 12n },
      P_Asteroid: maxRange,
      P_GameConfig: {
        motherlodeDistance: 10n,
        maxMotherlodesPerAsteroid: 6n,
        motherlodeChanceInv: 4n,
        unitProductionRate: 100n,
        travelTime: 10n,
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
      2: {
        P_RequiredResources: getResourceValues({ Lithium: 150000 }),
        Dimensions: { width: 17, height: 13 },
        P_RequiredBaseLevel: { value: 2n },
      },
      3: {
        P_RequiredResources: getResourceValues({ Alloy: 100000 }),
        Dimensions: { width: 21, height: 15 },
        P_RequiredBaseLevel: { value: 3n },
      },
      4: {
        P_RequiredResources: getResourceValues({ Titanium: 50000 }),
        Dimensions: { width: 25, height: 17 },
        P_RequiredBaseLevel: { value: 4n },
      },
      5: {
        P_RequiredResources: getResourceValues({ Platinum: 100000 }),
        Dimensions: { width: 29, height: 19 },
        P_RequiredBaseLevel: { value: 5n },
      },
      6: {
        P_RequiredResources: getResourceValues({ Iridium: 100000 }),
        Dimensions: { width: 33, height: 23 },
        P_RequiredBaseLevel: { value: 6n },
      },
      7: {
        P_RequiredResources: getResourceValues({ Kimberlite: 100000 }),
        Dimensions: { width: maxRange.xBounds, height: maxRange.yBounds },
        P_RequiredBaseLevel: { value: 7n },
      },
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
        P_Production: getResourceValues({ U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      2: {
        P_RequiredResources: getResourceValues({ Copper: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[2]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      3: {
        P_RequiredResources: getResourceValues({ Copper: 300000, PVCell: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[3]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 1 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 700000, Alloy: 60000, PVCell: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[4]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 2 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 1000000, Titanium: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[5]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 3 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 2500000, Titanium: 150000, Platinum: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[6]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 4 }),
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
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 5 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      8: {
        P_RequiredResources: getResourceValues({ Kimberlite: 500000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[8]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 6 }),
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
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Iron: 50 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Copper: 50000 }),
        P_Production: getResourceValues({ Iron: 65 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 500000 }),
        P_Production: getResourceValues({ Iron: 80 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 3000000 }),
        P_Production: getResourceValues({ Iron: 95 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 10000000 }),
        P_Production: getResourceValues({ Iron: 110 }),
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
        P_Production: getResourceValues({ Copper: 30 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 50000, Copper: 15000 }),
        P_Production: getResourceValues({ Copper: 40 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 1500000, Copper: 500000 }),
        P_Production: getResourceValues({ Copper: 50 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 5000000, Copper: 1500000 }),
        P_Production: getResourceValues({ Copper: 60 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000000, Copper: 5000000 }),
        P_Production: getResourceValues({ Copper: 70 }),
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
        P_Production: getResourceValues({ Lithium: 20 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 2000000 }),
        P_Production: getResourceValues({ Lithium: 25 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 5000000 }),
        P_Production: getResourceValues({ Lithium: 30 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 7500000 }),
        P_Production: getResourceValues({ Lithium: 35 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 12500000 }),
        P_Production: getResourceValues({ Lithium: 40 }),
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
        P_RequiredResources: getResourceValues({ Iron: 250000, U_Electricity: 5000 }),
        P_Production: getResourceValues({ Sulfur: 10 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 1000000, Copper: 150000, U_Electricity: 7500 }),
        P_Production: getResourceValues({ Sulfur: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2500000, Copper: 500000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ Sulfur: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 5000000, Copper: 1500000, U_Electricity: 12500 }),
        P_Production: getResourceValues({ Sulfur: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000000, Copper: 5000000, U_Electricity: 15000 }),
        P_Production: getResourceValues({ Sulfur: 20 }),
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
        P_Production: getResourceValues({ IronPlate: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 200000, Lithium: 75000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 45 }),
        P_Production: getResourceValues({ IronPlate: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 5000000, Lithium: 2500000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 55 }),
        P_Production: getResourceValues({ IronPlate: 15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 15000000, Lithium: 7500000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 65 }),
        P_Production: getResourceValues({ IronPlate: 17 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 25000000, Titanium: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 75 }),
        P_Production: getResourceValues({ IronPlate: 20 }),
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
        P_RequiredResources: getResourceValues({ Iron: 500000, IronPlate: 50000, U_Electricity: 10000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 35, Copper: 20 }),
        P_Production: getResourceValues({ Alloy: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 5000000, IronPlate: 250000, U_Electricity: 12000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 50, Copper: 30 }),
        P_Production: getResourceValues({ Alloy: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 12500000, IronPlate: 1000000, U_Electricity: 15000 }),
        P_RequiredDependencies: getResourceValues({ Iron: 60, Copper: 35 }),
        P_Production: getResourceValues({ Alloy: 9 }),
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
        P_Production: getResourceValues({ PVCell: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 350000, Lithium: 250000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 20, Copper: 30 }),
        P_Production: getResourceValues({ PVCell: 7 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 750000, Lithium: 1000000 }),
        P_RequiredDependencies: getResourceValues({ Lithium: 25, Copper: 35 }),
        P_Production: getResourceValues({ PVCell: 9 }),
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
        P_RequiredResources: getResourceValues({
          Iron: 2000000,
          Copper: 2000000,
          Iridium: 50000,
          U_Electricity: 50000,
        }),
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
          U_Electricity: 10000,
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
        P_Production: getResourceValues({ U_Electricity: 30000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ PVCell: 400000, Copper: 500000 }),
        P_Production: getResourceValues({ U_Electricity: 60000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ PVCell: 500000, Copper: 1500000 }),
        P_Production: getResourceValues({ U_Electricity: 80000 }),
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
        P_Production: getResourceValues({ U_Housing: 4000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Sulfur: 50000, Copper: 200000 }),
        P_Production: getResourceValues({ U_Housing: 6000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 150000, Copper: 800000 }),
        P_Production: getResourceValues({ U_Housing: 8000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Copper: 200000 }),
        P_Production: getResourceValues({ U_Housing: 10000 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Sulfur: 100000, Titanium: 50000 }),
        P_Production: getResourceValues({ U_Housing: 12000 }),
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
        P_RequiredResources: getResourceValues({ Iron: 500000, Lithium: 150000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Housing: 15000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Copper: 1750000, U_Electricity: 20000 }),
        P_Production: getResourceValues({ U_Housing: 25000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Copper: 3000000, U_Electricity: 30000 }),
        P_Production: getResourceValues({ U_Housing: 35000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Platinum: 75000, U_Electricity: 40000 }),
        P_Production: getResourceValues({ U_Housing: 50000 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 7500000, Kimberlite: 250000, U_Electricity: 50000 }),
        P_Production: getResourceValues({ U_Housing: 60000 }),
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
        P_RequiredResources: getResourceValues({ Lithium: 200000, U_Electricity: 10000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 200000, U_Electricity: 15000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Lithium: 750000, U_Electricity: 20000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Sulfur: 1500000, Platinum: 100000, U_Electricity: 30000 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Sulfur: 5000000, Iridium: 200000, U_Electricity: 40000 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 7500000, Kimberlite: 100000, U_Electricity: 50000 }),
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
        P_RequiredResources: getResourceValues({ Sulfur: 50000, Copper: 250000, U_Electricity: 5000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Copper: 200000, U_Electricity: 10000 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Sulfur: 2000000, Titanium: 10000, U_Electricity: 15000 }),
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
        P_Production: getResourceValues({ U_MaxMoves: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Sulfur: 125000 }),
        P_Production: getResourceValues({ U_MaxMoves: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Sulfur: 125000, Kimberlite: 10000 }),
        P_Production: getResourceValues({ U_MaxMoves: 3 }),
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
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Sulfur: 500000, Alloy: 200000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Defense: 5000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Platinum: 50000,
          Sulfur: 800000,
          Alloy: 500000,
          U_Electricity: 20000,
        }),
        P_Production: getResourceValues({ U_Defense: 15000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({
          Iridium: 100000,
          Sulfur: 1500000,
          Alloy: 2000000,
          U_Electricity: 30000,
        }),
        P_Production: getResourceValues({ U_Defense: 50000 }),
      },
    },
  },

  ShieldGenerator: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Sulfur: 1000000, Alloy: 500000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Platinum: 50000,
          Sulfur: 2000000,
          Alloy: 1000000,
          U_Electricity: 10000,
        }),

        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Iridium: 100000,
          Sulfur: 5000000,
          Alloy: 2000000,
          U_Electricity: 10000,
        }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }),
      },
    },
  },

  Vault: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ PVCell: 100000, Sulfur: 50000, U_Electricity: 5000 }),
        P_Production: getResourceValues({ U_Unraidable: 75000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ PVCell: 200000, Sulfur: 150000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Unraidable: 200000, U_AdvancedUnraidable: 10000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Titanium: 50000,
          PVCell: 200000,
          Sulfur: 150000,
          U_Electricity: 15000,
        }),
        P_Production: getResourceValues({ U_Unraidable: 300000, U_AdvancedUnraidable: 20000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Titanium: 150000,
          PVCell: 2000000,
          Sulfur: 1500000,
          U_Electricity: 20000,
        }),
        P_Production: getResourceValues({ U_Unraidable: 500000, U_AdvancedUnraidable: 50000 }),
      },
    },
  },

  /* -------------------------------- Resources ------------------------------- */
  // NOTE: To check if a resource is a utility, call P_IsUtility.get(EResource.<resource>);
  IsUtility: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("U_Electricity")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Housing")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Vessel")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_MaxMoves")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Defense")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("M_DefenseMultiplier")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Unraidable")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_AdvancedUnraidable")]: { P_IsUtility: { value: true } },
    },
  },

  IsAdvancedResource: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("Titanium")]: { P_IsAdvancedResource: { value: true } },
      [MUDEnums.EResource.indexOf("Platinum")]: { P_IsAdvancedResource: { value: true } },
      [MUDEnums.EResource.indexOf("Iridium")]: { P_IsAdvancedResource: { value: true } },
      [MUDEnums.EResource.indexOf("Kimberlite")]: { P_IsAdvancedResource: { value: true } },
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
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 120n,
          defense: 300n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 30000 }),
        P_RequiredBaseLevel: { value: 4n },

        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 42n,
          defense: 315n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 44n,
          defense: 330n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 46n,
          defense: 345n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 160000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 150n,
          defense: 450n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 157n,
          defense: 475n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 165n,
          defense: 500n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 172n,
          defense: 525n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 160000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 180n,
          defense: 550n,
          cargo: 10000n,
          speed: 14n,
          trainingTime: 150n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 6000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 187n,
          defense: 575n,
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
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 300n,
          defense: 50n,
          cargo: 10000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 315n,
          defense: 52n,
          cargo: 10000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 330n,
          defense: 55n,
          cargo: 10000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 100000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 345n,
          defense: 57n,
          cargo: 10000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 160000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 360n,
          defense: 60n,
          cargo: 10000n,
          speed: 16n,
          trainingTime: 120n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, PVCell: 4000, U_Housing: 100 }),
        P_Unit: {
          attack: 375n,
          defense: 62n,
          cargo: 10000n,
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredResources: getResourceValues({ Titanium: 1500, U_Housing: 300 }),
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
        P_RequiredBaseLevel: { value: 3n },
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 20n,
          defense: 5000n,
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
          defense: 5500n,
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
          defense: 6000n,
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
          defense: 6500n,
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
          defense: 7000n,
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ Iron: 6000, U_Housing: 100 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 80n,
          defense: 100n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 500000, IronPlate: 5000000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 2n },
        P_Unit: {
          attack: 84n,
          defense: 105n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 5000000, IronPlate: 50000000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 3n },
        P_Unit: {
          attack: 90n,
          defense: 110n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 10000000, IronPlate: 10000000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 4n },
        P_Unit: {
          attack: 95n,
          defense: 115n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 25000000, IronPlate: 25000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 5n },
        P_Unit: {
          attack: 100n,
          defense: 120n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 50000000, IronPlate: 5000000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 3500, U_Housing: 100 }),
        P_MiningRate: { value: 6n },
        P_Unit: {
          attack: 110n,
          defense: 125n,
          cargo: 3000n,
          speed: 20n,
          trainingTime: 40n,
        },
      },
    },
  },
  /* ------------------------------- Multipliers ------------------------------ */
  Iron: {
    keys: [{ [EResource.Iron]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 10n },
    },
  },
  Copper: {
    keys: [{ [EResource.Copper]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 15n },
    },
  },
  Lithium: {
    keys: [{ [EResource.Lithium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 20n },
    },
  },
  Sulfur: {
    keys: [{ [EResource.Sulfur]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 50n },
    },
  },
  Titanium: {
    keys: [{ [EResource.Titanium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 500n },
    },
  },
  Iridium: {
    keys: [{ [EResource.Iridium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 1500n },
    },
  },
  Osmium: {
    keys: [{ [EResource.Osmium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 300n },
    },
  },
  Tungsten: {
    keys: [{ [EResource.Tungsten]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 400n },
    },
  },
  Kimberlite: {
    keys: [{ [EResource.Kimberlite]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 10000n },
    },
  },
  Platinum: {
    keys: [{ [EResource.Platinum]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 5000n },
    },
  },
  Uraninite: {
    keys: [{ [EResource.Uraninite]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 2000n },
    },
  },
  Bolutite: {
    keys: [{ [EResource.Bolutite]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 2500n },
    },
  },
  IronPlate: {
    keys: [{ [EResource.IronPlate]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 40n },
    },
  },
  PVCell: {
    keys: [{ [EResource.PVCell]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 100n },
    },
  },
  Alloy: {
    keys: [{ [EResource.Alloy]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 170n },
    },
  },
  RocketFuel: {
    keys: [{ [EResource.RocketFuel]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 200n },
    },
  },

  /* ------------------------------- Objectives ------------------------------- */
  Objectives: {
    levels: idsToPrototypes(MUDEnums.EObjectives),
  },

  UpgradeMainBase: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 300000 }),
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2n } },
    },
  },

  DefeatPirateBase1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_DefeatedPirates: { value: encodeArray(["BuildWorkshop"]) },
      P_SpawnPirateAsteroid: {
        x: -10,
        y: 22,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [10n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate"]),
        resourceAmounts: [50000n, 50000n, 50000n],
      },
      P_ResourceReward: getResourceValues({ Copper: 100000, Iron: 100000 }),
    },
  },
  DefeatPirateBase2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase1"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase1"]) },
      P_SpawnPirateAsteroid: {
        x: -20,
        y: 10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [40n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate"]),
        resourceAmounts: [150000n, 150000n, 150000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 50 }),
    },
  },
  DefeatPirateBase3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase2"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase2"]) },
      P_SpawnPirateAsteroid: {
        x: -12,
        y: -15,
        units: encodeArray(["AnvilDrone", "MinutemanMarine"]),
        unitAmounts: [20n, 120n],
        resources: indexifyResourceArray(["PVCell", "Lithium", "Sulfur"]),
        resourceAmounts: [100000n, 100000n, 100000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 100 }),
    },
  },
  DefeatPirateBase4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase3"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase3"]) },
      P_SpawnPirateAsteroid: {
        x: -3,
        y: -15,
        units: encodeArray(["AnvilDrone", "MinutemanMarine"]),
        unitAmounts: [50n, 400n],
        resources: indexifyResourceArray(["Alloy", "Copper", "Sulfur"]),
        resourceAmounts: [100000n, 500000n, 200000n],
      },
      P_UnitReward: getUnitValues({ AnvilDrone: 70 }),
    },
  },
  DefeatPirateBase5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase4"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase4"]) },
      P_SpawnPirateAsteroid: {
        x: -12,
        y: 17,
        units: encodeArray(["AegisDrone", "TridentMarine"]),
        unitAmounts: [50n, 250n],
        resources: indexifyResourceArray(["Alloy", "PVCell", "Copper"]),
        resourceAmounts: [200000n, 200000n, 1000000n],
      },
      P_UnitReward: getUnitValues({ HammerDrone: 120 }),
    },
  },
  DefeatPirateBase6: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase5"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase5"]) },
      P_SpawnPirateAsteroid: {
        x: 8,
        y: 12,
        units: encodeArray(["AegisDrone", "AnvilDrone"]),
        unitAmounts: [100n, 150n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "Sulfur"]),
        resourceAmounts: [1000000n, 1000000n, 1000000n, 1000000n],
      },
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
  },
  DefeatPirateBase7: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase6"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase6"]) },
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
      P_ResourceReward: getResourceValues({ Titanium: 20000 }),
    },
  },

  BuildIronMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["IronMine"]) },
      P_ResourceReward: getResourceValues({ Iron: 20000 }),
    },
  },

  BuildCopperMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["CopperMine"]) },
      P_ResourceReward: getResourceValues({ Copper: 20000, Iron: 20000 }),
    },
  },

  BuildLithiumMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["LithiumMine"]) },
      P_ResourceReward: getResourceValues({ Lithium: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildSulfurMine: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["SulfurMine"]) },
      P_ResourceReward: getResourceValues({ Sulfur: 50000, Copper: 100000 }),
    },
  },
  BuildIronPlateFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["IronPlateFactory"]) },
      P_ResourceReward: getResourceValues({ Iron: 50000 }),
    },
  },

  BuildGarage: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Garage"]) },
      P_UnitReward: getUnitValues({ MinutemanMarine: 10 }),
    },
  },

  BuildWorkshop: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildGarage"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Workshop"]) },
      P_SpawnPirateAsteroid: {
        x: 10,
        y: 10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [10n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate"]),
        resourceAmounts: [50000n, 50000n, 50000n],
      },
      P_ResourceReward: getResourceValues({ IronPlate: 50000 }),
    },
  },

  BuildPVCellFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildLithiumMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["PVCellFactory"]) },
      P_ResourceReward: getResourceValues({ PVCell: 20000 }),
    },
  },
  BuildSolarPanel: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildPVCellFactory"]) },
      P_HasBuiltBuildings: { value: encodeArray(["SolarPanel"]) },
      P_ResourceReward: getResourceValues({ Iron: 100000, Copper: 100000 }),
    },
  },

  BuildDroneFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["DroneFactory"]) },
      P_UnitReward: getUnitValues({ MinutemanMarine: 100 }),
    },
  },

  BuildStarmapper: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Starmapper"]) },
      P_UnitReward: getUnitValues({ HammerDrone: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  BuildSAMLauncher: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["SAM"]) },
      P_UnitReward: getUnitValues({ AnvilDrone: 50 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildVault: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Vault"]) },
      P_UnitReward: getUnitValues({ AnvilDrone: 50 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildShieldGenerator: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["ShieldGenerator"]) },
      P_UnitReward: getUnitValues({ AegisDrone: 150 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  CommissionMiningVessel: {
    tables: {
      P_RequiredUnits: getUnitValues({ MiningVessel: 1 }),
      P_ResourceReward: getResourceValues({ Alloy: 100000 }),
    },

    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },

  TrainMinutemanMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_RequiredUnits: getUnitValues({ MinutemanMarine: 50 }),
      P_ResourceReward: getResourceValues({ IronPlate: 50000 }),
    },
  },
  TrainMinutemanMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine1"]) },
      P_RequiredUnits: getUnitValues({ MinutemanMarine: 100 }),
      P_ResourceReward: getResourceValues({ Sulfur: 100000 }),
    },
  },
  TrainMinutemanMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine2"]) },
      P_RequiredUnits: getUnitValues({ MinutemanMarine: 200 }),
      P_ResourceReward: getResourceValues({ Sulfur: 300000 }),
    },
  },

  TrainTridentMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_RequiredUnits: getUnitValues({ TridentMarine: 50 }),
      P_ResourceReward: getResourceValues({ Lithium: 100000 }),
    },
  },
  TrainTridentMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine1"]) },
      P_RequiredUnits: getUnitValues({ TridentMarine: 100 }),
      P_ResourceReward: getResourceValues({ Lithium: 500000 }),
    },
  },
  TrainTridentMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine2"]) },
      P_RequiredUnits: getUnitValues({ TridentMarine: 200 }),
      P_ResourceReward: getResourceValues({ Sulfur: 1000000 }),
    },
  },

  TrainAnvilDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_RequiredUnits: getUnitValues({ AnvilDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainAnvilDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone1"]) },
      P_RequiredUnits: getUnitValues({ AnvilDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 200000 }),
    },
  },
  TrainAnvilDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone2"]) },
      P_RequiredUnits: getUnitValues({ AnvilDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 500000 }),
    },
  },

  TrainHammerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_RequiredUnits: getUnitValues({ HammerDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  TrainHammerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone1"]) },
      P_RequiredUnits: getUnitValues({ HammerDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 500000 }),
    },
  },
  TrainHammerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone2"]) },
      P_RequiredUnits: getUnitValues({ HammerDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 1000000 }),
    },
  },

  TrainAegisDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_RequiredUnits: getUnitValues({ AegisDrone: 20 }),
      P_ResourceReward: getResourceValues({ Alloy: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  TrainAegisDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone1"]) },
      P_RequiredUnits: getUnitValues({ AegisDrone: 50 }),
      P_ResourceReward: getResourceValues({ Alloy: 500000 }),
    },
  },
  TrainAegisDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone2"]) },
      P_RequiredUnits: getUnitValues({ HammerDrone: 100 }),
      P_ResourceReward: getResourceValues({ Alloy: 1000000 }),
    },
  },

  TrainStingerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_RequiredUnits: getUnitValues({ StingerDrone: 20 }),
      P_ResourceReward: getResourceValues({ Iron: 500000, Copper: 500000, Lithium: 500000, Sulfur: 500000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 5n } } },
  },
  TrainStingerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone1"]) },
      P_RequiredUnits: getUnitValues({ StingerDrone: 50 }),
      P_ResourceReward: getResourceValues({ Iron: 1500000, Copper: 1500000, Lithium: 1500000, Sulfur: 1500000 }),
    },
  },
  TrainStingerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone2"]) },
      P_RequiredUnits: getUnitValues({ HammerDrone: 100 }),
      P_ResourceReward: getResourceValues({ Iron: 7500000, Copper: 7500000, Lithium: 7500000, Sulfur: 7500000 }),
    },
  },

  MineTitanium1: {
    tables: {
      P_ProducedResources: getResourceValues({ Titanium: 100000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineTitanium2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineTitanium1"]) },
      P_ProducedResources: getResourceValues({ Titanium: 300000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 100 }),
    },
  },
  MineTitanium3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineTitanium2"]) },
      P_ProducedResources: getResourceValues({ Titanium: 1000000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 250 }),
    },
  },

  MinePlatinum1: {
    tables: {
      P_ProducedResources: getResourceValues({ Platinum: 100000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MinePlatinum2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MinePlatinum1"]) },
      P_ProducedResources: getResourceValues({ Platinum: 300000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },
  MinePlatinum3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MinePlatinum2"]) },
      P_ProducedResources: getResourceValues({ Platinum: 1000000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },

  MineIridium1: {
    tables: {
      P_ProducedResources: getResourceValues({ Iridium: 100000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineIridium2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineIridium1"]) },
      P_ProducedResources: getResourceValues({ Iridium: 300000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 100 }),
    },
  },
  MineIridium3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineIridium2"]) },
      P_ProducedResources: getResourceValues({ Iridium: 1000000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 250 }),
    },
  },

  MineKimberlite1: {
    tables: {
      P_ProducedResources: getResourceValues({ Kimberlite: 100000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 15, HammerDrone: 15, AegisDrone: 15 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineKimberlite2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineKimberlite1"]) },
      P_ProducedResources: getResourceValues({ Kimberlite: 300000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 50, HammerDrone: 50, AegisDrone: 50 }),
    },
  },
  MineKimberlite3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineKimberlite2"]) },
      P_ProducedResources: getResourceValues({ Kimberlite: 1000000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 100, HammerDrone: 100, AegisDrone: 100 }),
    },
  },

  RaidRawResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ Iron: 200000, Copper: 200000, Lithium: 200000, Sulfur: 200000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 1n } } },
  },
  RaidRawResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources1"]) },
      P_RaidedResources: getResourceValues({ Iron: 500000, Copper: 500000, Lithium: 500000, Sulfur: 500000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },
  RaidRawResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources2"]) },
      P_RaidedResources: getResourceValues({ Iron: 2500000, Copper: 2500000, Lithium: 2500000, Sulfur: 2500000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 300 }),
    },
  },

  RaidFactoryResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ IronPlate: 200000, PVCell: 200000, Alloy: 200000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 1n } } },
  },
  RaidFactoryResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidFactoryResources1"]) },
      P_RaidedResources: getResourceValues({ IronPlate: 500000, PVCell: 500000, Alloy: 500000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 100 }),
    },
  },
  RaidFactoryResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidFactoryResources2"]) },
      P_RaidedResources: getResourceValues({ IronPlate: 2500000, PVCell: 2500000, Alloy: 2500000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 300 }),
    },
  },

  RaidMotherlodeResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ Titanium: 200000, Platinum: 200000, Iridium: 200000, Kimberlite: 200000 }),
      P_UnitReward: getUnitValues({ StingerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 1n } } },
  },
  RaidMotherlodeResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidMotherlodeResource1"]) },
      P_RaidedResources: getResourceValues({ Titanium: 500000, Platinum: 500000, Iridium: 500000, Kimberlite: 500000 }),
      P_UnitReward: getUnitValues({ StingerDrone: 100 }),
    },
  },
  RaidMotherlodeResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidMotherlodeResources2"]) },
      P_RaidedResources: getResourceValues({
        Titanium: 2500000,
        Platinum: 2500000,
        Iridium: 2500000,
        Kimberlite: 2500000,
      }),
      P_UnitReward: getUnitValues({ StingerDrone: 300 }),
    },
  },

  DestroyEnemyUnits1: {
    tables: {
      P_DestroyedUnits: getUnitValues({ MinutemanMarine: 500 }),
      P_ResourceReward: getResourceValues({ Copper: 300000, Sulfur: 300000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 1n } } },
  },
  DestroyEnemyUnits2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits1"]) },
      P_DestroyedUnits: getUnitValues({ TridentMarine: 500 }),
      P_ResourceReward: getResourceValues({ Copper: 1000000, Sulfur: 1000000 }),
    },
  },
  DestroyEnemyUnits3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits2"]) },
      P_DestroyedUnits: getUnitValues({ AnvilDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 3000000, Sulfur: 3000000 }),
    },
  },
  DestroyEnemyUnits4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits3"]) },
      P_DestroyedUnits: getUnitValues({ AegisDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 30000000, Sulfur: 30000000 }),
    },
  },
  DestroyEnemyUnits5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits4"]) },
      P_DestroyedUnits: getUnitValues({ StingerDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 50000000, Titanium: 300000, Platinum: 300000 }),
    },
  },

  // todo: expand base logic
  ExpandBase1: {
    tables: {
      P_RequiredExpansion: { value: 2n },
      P_ResourceReward: getResourceValues({ Iron: 200000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  ExpandBase2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase1"]) },
      P_RequiredExpansion: { value: 3n },
      P_ResourceReward: getResourceValues({ Iron: 500000, Copper: 500000 }),
    },
  },
  ExpandBase3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase2"]) },
      P_RequiredExpansion: { value: 4n },
      P_ResourceReward: getResourceValues({ Iron: 500000, Copper: 500000 }),
    },
  },
  ExpandBase4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase3"]) },
      P_RequiredExpansion: { value: 5n },
      P_ResourceReward: getResourceValues({ Iron: 1000000, Copper: 1000000 }),
    },
  },
  ExpandBase5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase4"]) },
      P_RequiredExpansion: { value: 6n },
      P_ResourceReward: getResourceValues({ Iron: 2000000, Copper: 2000000 }),
    },
  },
  ExpandBase6: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase5"]) },
      P_RequiredExpansion: { value: 7n },
      P_ResourceReward: getResourceValues({ Iron: 10000000, Copper: 10000000 }),
    },
  },
};
