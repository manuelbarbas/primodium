import { Hex } from "viem";
import { config } from "../mud.config";
import {
  encodeArray,
  getResourceValue,
  getResourceValues,
  getUnitValues,
  idsToPrototypes,
  indexifyResourceArray,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/prototypeGenUtils";
import { PrototypesConfig } from "../ts/prototypes/types";
import { EResource, ESize, MUDEnums } from "./enums";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32, { encodeAddress } from "./util/encodeBytes32";

const mainBaseMaxResourceUpgrades = {
  1: { Iron: 500000, Copper: 500000, IronPlate: 250000 },
  2: {
    Iron: 1000000,
    Copper: 1000000,
    IronPlate: 500000,
    Lithium: 1000000,
    PVCell: 500000,
    Alloy: 500000,
  },
  3: {
    Iron: 2500000,
    Copper: 2500000,
    IronPlate: 1500000,
    Lithium: 2500000,
    PVCell: 1500000,
    Alloy: 1500000,
    Titanium: 50000,
    Platinum: 50000,
    Iridium: 50000,
    Kimberlite: 50000,
  },
  4: {
    Iron: 7500000,
    Copper: 7500000,
    Lithium: 7500000,
    IronPlate: 5000000,
    PVCell: 5000000,
    Alloy: 5000000,
    Titanium: 100000,
    Platinum: 100000,
    Iridium: 100000,
    Kimberlite: 100000,
  },
  5: {
    Iron: 15000000,
    Copper: 15000000,
    IronPlate: 10000000,
    Lithium: 15000000,
    PVCell: 10000000,
    Alloy: 10000000,
    Titanium: 300000,
    Platinum: 300000,
    Iridium: 300000,
    Kimberlite: 300000,
  },
  6: {
    Iron: 25000000,
    Copper: 25000000,
    IronPlate: 25000000,
    Lithium: 25000000,
    PVCell: 25000000,
    Alloy: 25000000,
    Titanium: 600000,
    Platinum: 600000,
    Iridium: 600000,
    Kimberlite: 600000,
  },
  7: {
    Iron: 75000000,
    Copper: 75000000,
    IronPlate: 50000000,
    Lithium: 75000000,
    PVCell: 50000000,
    Alloy: 50000000,
    Titanium: 750000,
    Platinum: 750000,
    Iridium: 750000,
    Kimberlite: 750000,
  },
  8: {
    Iron: 150000000,
    Copper: 150000000,
    IronPlate: 125000000,
    Lithium: 150000000,
    PVCell: 125000000,
    Alloy: 125000000,
    Titanium: 1000000,
    Platinum: 1000000,
    Iridium: 1000000,
    Kimberlite: 1000000,
  },
};

const storageUnitMaxResourceUpgrades = {
  1: {
    Iron: 200000,
    Copper: 200000,
    Lithium: 200000,
    IronPlate: 100000,
    PVCell: 100000,
    Alloy: 100000,
  },
  2: {
    Iron: 500000,
    Copper: 500000,
    Lithium: 500000,
    IronPlate: 250000,
    PVCell: 250000,
    Alloy: 250000,
    Titanium: 25000,
    Platinum: 25000,
    Iridium: 25000,
    Kimberlite: 25000,
  },
  3: {
    Iron: 1500000,
    Copper: 1500000,
    Lithium: 1500000,
    IronPlate: 500000,
    PVCell: 500000,
    Alloy: 500000,
    Titanium: 50000,
    Platinum: 50000,
    Iridium: 50000,
    Kimberlite: 50000,
  },
  4: {
    Iron: 2500000,
    Copper: 2500000,
    Lithium: 2500000,
    IronPlate: 1000000,
    PVCell: 1000000,
    Alloy: 1000000,
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
        admin: encodeAddress("0"),
        motherlodeDistance: 10n,
        maxMotherlodesPerAsteroid: 6n,
        motherlodeChanceInv: 4n,
        unitProductionRate: 100n,
        travelTime: 10n,
        worldSpeed: 100n,
        tax: 10n, // out of 1000
      },
      P_GameConfig2: {
        wETHAddress: encodeAddress("0"),
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
      P_MaxLevel: { value: 8n },
    },
    levels: {
      1: { Dimensions: { width: 11, height: 9 }, P_RequiredBaseLevel: { value: 1n } },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 200000 }),
        Dimensions: { width: 13, height: 11 },
        P_RequiredBaseLevel: { value: 2n },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 150000 }),
        Dimensions: { width: 17, height: 13 },
        P_RequiredBaseLevel: { value: 2n },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 1500000 }),
        Dimensions: { width: 21, height: 15 },
        P_RequiredBaseLevel: { value: 3n },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 500000, Kimberlite: 150000 }),
        Dimensions: { width: 25, height: 17 },
        P_RequiredBaseLevel: { value: 4n },
      },
      6: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 1500000, Kimberlite: 500000 }),
        Dimensions: { width: 29, height: 19 },
        P_RequiredBaseLevel: { value: 5n },
      },
      7: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 2500000, Kimberlite: 1000000 }),
        Dimensions: { width: 33, height: 23 },
        P_RequiredBaseLevel: { value: 6n },
      },
      8: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 5000000, Kimberlite: 1500000 }),
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
        P_RequiredResources: getResourceValues({ Copper: 1000000, PVCell: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[3]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 2 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 2500000, PVCell: 500000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[4]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 3 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 7500000, PVCell: 50000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[5]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 4 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 125000000, Titanium: 150000, Platinum: 150000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[6]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 5 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      7: {
        P_RequiredResources: getResourceValues({
          Copper: 250000000,
          Titanium: 500000,
          Platinum: 500000,
          Iridium: 500000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[7]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 6 }),
        P_UnitProdMultiplier: { value: 100n },
      },
      8: {
        P_RequiredResources: getResourceValues({
          Copper: 250000000,
          Titanium: 1500000,
          Platinum: 1500000,
          Iridium: 1500000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[8]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 7 }),
        P_UnitProdMultiplier: { value: 100n },
      },
    },
  },
  ...upgradesByLevel("MainBase", mainBaseMaxResourceUpgrades),

  // Mines
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 7n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Iron: 25 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Iron: 35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Iron: 45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 3000000 }),
        P_Production: getResourceValues({ Iron: 55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 10000000 }),
        P_Production: getResourceValues({ Iron: 65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 20000000 }),
        P_Production: getResourceValues({ Iron: 75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 50000000 }),
        P_Production: getResourceValues({ Iron: 90 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 100000000 }),
        P_Production: getResourceValues({ Iron: 120 }),
      },
    },
  },
  CopperMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 7n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Copper: 25 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Copper: 35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Copper: 45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 3000000 }),
        P_Production: getResourceValues({ Copper: 55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 10000000 }),
        P_Production: getResourceValues({ Copper: 65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 20000000 }),
        P_Production: getResourceValues({ Copper: 75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 50000000 }),
        P_Production: getResourceValues({ Copper: 90 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 100000000 }),
        P_Production: getResourceValues({ Copper: 120 }),
      },
    },
  },
  LithiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 7n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2n }, P_Production: getResourceValues({ Lithium: 25 }) },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Lithium: 35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Lithium: 45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 3000000 }),
        P_Production: getResourceValues({ Lithium: 55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 10000000 }),
        P_Production: getResourceValues({ Lithium: 65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 20000000 }),
        P_Production: getResourceValues({ Lithium: 75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 50000000 }),
        P_Production: getResourceValues({ Lithium: 90 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 100000000 }),
        P_Production: getResourceValues({ Lithium: 120 }),
      },
    },
  },

  // Factories
  IronPlateFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 7n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Copper: 20000 }),
        P_RequiredDependency: getResourceValue({ Iron: 20 }),
        P_Production: getResourceValues({ IronPlate: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 200000 }),
        P_RequiredDependency: getResourceValue({ Iron: 30 }),
        P_Production: getResourceValues({ IronPlate: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 750000 }),
        P_RequiredDependency: getResourceValue({ Iron: 40 }),
        P_Production: getResourceValues({ IronPlate: 17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 2500000 }),
        P_RequiredDependency: getResourceValue({ Iron: 50 }),
        P_Production: getResourceValues({ IronPlate: 23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 7500000 }),
        P_RequiredDependency: getResourceValue({ Iron: 60 }),
        P_Production: getResourceValues({ IronPlate: 30 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 25000000 }),
        P_RequiredDependency: getResourceValue({ Iron: 70 }),
        P_Production: getResourceValues({ IronPlate: 40 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 100000000 }),
        P_RequiredDependency: getResourceValue({ Iron: 80 }),
        P_Production: getResourceValues({ IronPlate: 55 }),
      },
    },
  },
  AlloyFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 7n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 20000 }),
        P_RequiredDependency: getResourceValue({ Copper: 20 }),
        P_Production: getResourceValues({ Alloy: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 200000 }),
        P_RequiredDependency: getResourceValue({ Copper: 30 }),
        P_Production: getResourceValues({ Alloy: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 750000 }),
        P_RequiredDependency: getResourceValue({ Copper: 40 }),
        P_Production: getResourceValues({ Alloy: 17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 2500000 }),
        P_RequiredDependency: getResourceValue({ Copper: 50 }),
        P_Production: getResourceValues({ Alloy: 23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 7500000 }),
        P_RequiredDependency: getResourceValue({ Copper: 60 }),
        P_Production: getResourceValues({ Alloy: 30 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 25000000 }),
        P_RequiredDependency: getResourceValue({ Copper: 70 }),
        P_Production: getResourceValues({ Alloy: 40 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 100000000 }),
        P_RequiredDependency: getResourceValue({ Copper: 80 }),
        P_Production: getResourceValues({ Alloy: 55 }),
      },
    },
  },
  PVCellFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 7n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 20000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 20 }),
        P_Production: getResourceValues({ PVCell: 8 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 200000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 30 }),
        P_Production: getResourceValues({ PVCell: 12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 750000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 40 }),
        P_Production: getResourceValues({ PVCell: 17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 2500000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 50 }),
        P_Production: getResourceValues({ PVCell: 23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 7500000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 60 }),
        P_Production: getResourceValues({ PVCell: 30 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 25000000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 70 }),
        P_Production: getResourceValues({ PVCell: 40 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 100000000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 80 }),
        P_Production: getResourceValues({ PVCell: 55 }),
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
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 2000000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Iron: 10000000,
          U_Electricity: 50000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Iron: 50000000,
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
        P_RequiredResources: getResourceValues({ PVCell: 20000 }),
        P_Production: getResourceValues({ U_Electricity: 30000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ PVCell: 400000 }),
        P_Production: getResourceValues({ U_Electricity: 60000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ PVCell: 1000000 }),
        P_Production: getResourceValues({ U_Electricity: 80000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ PVCell: 2500000 }),
        P_Production: getResourceValues({ U_Electricity: 80000 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ PVCell: 7500000 }),
        P_Production: getResourceValues({ U_Electricity: 100000 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ PVCell: 17500000 }),
        P_Production: getResourceValues({ U_Electricity: 120000 }),
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
        P_RequiredResources: getResourceValues({ Lithium: 150000 }),
        P_Production: getResourceValues({ U_Housing: 6000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Lithium: 500000 }),
        P_Production: getResourceValues({ U_Housing: 8000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Lithium: 1500000 }),
        P_Production: getResourceValues({ U_Housing: 10000 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Lithium: 5000000 }),
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
        P_RequiredResources: getResourceValues({ Lithium: 500000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Housing: 24000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Lithium: 1500000, U_Electricity: 20000 }),
        P_Production: getResourceValues({ U_Housing: 37000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Lithium: 5000000, U_Electricity: 30000 }),
        P_Production: getResourceValues({ U_Housing: 50000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 15000000, U_Electricity: 40000 }),
        P_Production: getResourceValues({ U_Housing: 64000 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 15000000, U_Electricity: 50000 }),
        P_Production: getResourceValues({ U_Housing: 80000 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 200000, U_Electricity: 10000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000000, U_Electricity: 15000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 2500000, U_Electricity: 20000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000000, U_Electricity: 30000 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000000, U_Electricity: 40000 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 100000000, U_Electricity: 50000 }),
        P_UnitProdMultiplier: { value: 300n },
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
        P_RequiredResources: getResourceValues({ IronPlate: 25000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ IronPlate: 500000 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 2500000, U_Electricity: 10000 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000000, U_Electricity: 15000 }),
        P_UnitProdMultiplier: { value: 500n },
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
        P_RequiredResources: getResourceValues({ IronPlate: 50000 }),
        P_Production: getResourceValues({ U_MaxMoves: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000000 }),
        P_Production: getResourceValues({ U_MaxMoves: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 2500000 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 200000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Defense: 10000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Alloy: 1500000,
          U_Electricity: 20000,
        }),
        P_Production: getResourceValues({ U_Defense: 25000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({
          Alloy: 5000000,
          U_Electricity: 30000,
        }),
        P_Production: getResourceValues({ U_Defense: 75000 }),
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
        P_RequiredResources: getResourceValues({ PVCell: 500000, Alloy: 500000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          PVCell: 1500000,
          Alloy: 1500000,
          U_Electricity: 10000,
        }),

        P_Production: getResourceValues({ M_DefenseMultiplier: 10 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          PVCell: 5000000,
          Alloy: 5000000,
          U_Electricity: 10000,
        }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 15 }),
      },
    },
  },

  Vault: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 4n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Alloy: 100000 }),
        P_Production: getResourceValues({ U_Unraidable: 75000 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Alloy: 750000, U_Electricity: 10000 }),
        P_Production: getResourceValues({ U_Unraidable: 200000, U_AdvancedUnraidable: 50000 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Alloy: 2000000,
          U_Electricity: 15000,
        }),
        P_Production: getResourceValues({ U_Unraidable: 500000, U_AdvancedUnraidable: 100000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Alloy: 10000000,
          U_Electricity: 20000,
        }),
        P_Production: getResourceValues({ U_Unraidable: 1000000, U_AdvancedUnraidable: 250000 }),
      },
    },
  },
  Market: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 4n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ U_Orders: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 750000 }),
        P_Production: getResourceValues({ U_Orders: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Iron: 2500000,
        }),
        P_Production: getResourceValues({ U_Orders: 3 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Iron: 10000000,
        }),
        P_Production: getResourceValues({ U_Orders: 4 }),
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
      [MUDEnums.EResource.indexOf("U_Orders")]: { P_IsUtility: { value: true } },
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

  OrderType: {
    levels: idsToPrototypes(MUDEnums.EOrderType),
  },

  LightningCraft: {
    tables: {
      P_MaxLevel: { value: 1n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 100 }),
        P_Unit: {
          attack: 10n,
          defense: 10n,
          cargo: 1000n,
          speed: 500n,
          trainingTime: 500n,
        },
      },
    },
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
          speed: 50n,
          trainingTime: 500n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 50000 }),
        P_RequiredBaseLevel: { value: 4n },

        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 130n,
          defense: 340n,
          cargo: 5000n,
          speed: 100n,
          trainingTime: 500n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 150000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 140n,
          defense: 360n,
          cargo: 7000n,
          speed: 150n,
          trainingTime: 500n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 500000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 150n,
          defense: 380n,
          cargo: 10000n,
          speed: 200n,
          trainingTime: 500n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1000000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 160n,
          defense: 400n,
          cargo: 12000n,
          speed: 250n,
          trainingTime: 500n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 2500000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Housing: 200 }),
        P_Unit: {
          attack: 170n,
          defense: 420n,
          cargo: 15000n,
          speed: 350n,
          trainingTime: 500n,
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
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 150n,
          defense: 500n,
          cargo: 10000n,
          speed: 70n,
          trainingTime: 1500n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 160n,
          defense: 550n,
          cargo: 12000n,
          speed: 150n,
          trainingTime: 1500n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 170n,
          defense: 600n,
          cargo: 14000n,
          speed: 200n,
          trainingTime: 1500n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 100000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 180n,
          defense: 750n,
          cargo: 16000n,
          speed: 250n,
          trainingTime: 1500n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 160000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 190n,
          defense: 800n,
          cargo: 18000n,
          speed: 300n,
          trainingTime: 1500n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 8000, PVCell: 10000, U_Housing: 300 }),
        P_Unit: {
          attack: 200n,
          defense: 850n,
          cargo: 20000n,
          speed: 400n,
          trainingTime: 1500n,
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
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 300n,
          defense: 50n,
          cargo: 10000n,
          speed: 30n,
          trainingTime: 1200n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 30000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 320n,
          defense: 60n,
          cargo: 12000n,
          speed: 50n,
          trainingTime: 1200n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 50000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 350n,
          defense: 70n,
          cargo: 14000n,
          speed: 90n,
          trainingTime: 1200n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 100000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 400n,
          defense: 80n,
          cargo: 16000n,
          speed: 150n,
          trainingTime: 1200n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 160000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 450n,
          defense: 90n,
          cargo: 20000n,
          speed: 200n,
          trainingTime: 1200n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 220000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 20000, PVCell: 5000, U_Housing: 200 }),
        P_Unit: {
          attack: 500n,
          defense: 100n,
          cargo: 25000n,
          speed: 250n,
          trainingTime: 1200n,
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
        P_RequiredResources: getResourceValues({ IronPlate: 150000, U_Housing: 300 }),
        P_Unit: {
          attack: 600n,
          defense: 250n,
          cargo: 30000n,
          speed: 100n,
          trainingTime: 5000n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 50000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 150000, U_Housing: 300 }),
        P_Unit: {
          attack: 900n,
          defense: 300n,
          cargo: 40000n,
          speed: 150n,
          trainingTime: 5000n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 150000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 150000, U_Housing: 300 }),
        P_Unit: {
          attack: 1200n,
          defense: 350n,
          cargo: 50000n,
          speed: 200n,
          trainingTime: 5000n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 500000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 150000, U_Housing: 300 }),
        P_Unit: {
          attack: 1500n,
          defense: 400n,
          cargo: 60000n,
          speed: 250n,
          trainingTime: 5000n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 1000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 150000, U_Housing: 300 }),
        P_Unit: {
          attack: 1800n,
          defense: 450n,
          cargo: 70000n,
          speed: 300n,
          trainingTime: 5000n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 1500000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 15000, U_Housing: 300 }),
        P_Unit: {
          attack: 2500n,
          defense: 500n,
          cargo: 80000n,
          speed: 400n,
          trainingTime: 5000n,
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
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_RequiredBaseLevel: { value: 3n },
        P_MiningRate: { value: 1n },
        P_Unit: {
          attack: 20n,
          defense: 5000n,
          cargo: 100000n,
          speed: 100n,
          trainingTime: 10000n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 50000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_MiningRate: { value: 2n },
        P_Unit: {
          attack: 50n,
          defense: 5500n,
          cargo: 100000n,
          speed: 200n,
          trainingTime: 10000n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 150000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_MiningRate: { value: 3n },
        P_Unit: {
          attack: 100n,
          defense: 6000n,
          cargo: 100000n,
          speed: 300n,
          trainingTime: 10000n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 500000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_MiningRate: { value: 4n },
        P_Unit: {
          attack: 250n,
          defense: 6500n,
          cargo: 100000n,
          speed: 400n,
          trainingTime: 10000n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 1000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_MiningRate: { value: 5n },
        P_Unit: {
          attack: 500n,
          defense: 7000n,
          cargo: 100000n,
          speed: 500n,
          trainingTime: 10000n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 1500000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 2000000, PVCell: 500000, U_Vessel: 1 }),
        P_MiningRate: { value: 6n },
        P_Unit: {
          attack: 1000n,
          defense: 7500n,
          cargo: 100000n,
          speed: 600n,
          trainingTime: 10000n,
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
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 40n,
          defense: 20n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 50000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 60n,
          defense: 30n,
          cargo: 3000n,
          speed: 50n,
          trainingTime: 100n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 150000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 80n,
          defense: 40n,
          cargo: 4000n,
          speed: 150n,
          trainingTime: 100n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 500000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 100n,
          defense: 50n,
          cargo: 5000n,
          speed: 200n,
          trainingTime: 100n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1000000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 120n,
          defense: 60n,
          cargo: 6000n,
          speed: 250n,
          trainingTime: 100n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1500000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000, U_Housing: 100 }),
        P_Unit: {
          attack: 150n,
          defense: 70n,
          cargo: 7000n,
          speed: 300n,
          trainingTime: 100n,
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
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 80n,
          defense: 100n,
          cargo: 3000n,
          speed: 50n,
          trainingTime: 200n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 150000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 100n,
          defense: 105n,
          cargo: 4000n,
          speed: 100n,
          trainingTime: 200n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 500000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 120n,
          defense: 110n,
          cargo: 5000n,
          speed: 150n,
          trainingTime: 200n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1000000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 140n,
          defense: 115n,
          cargo: 6000n,
          speed: 200n,
          trainingTime: 200n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 2500000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 160n,
          defense: 120n,
          cargo: 7000n,
          speed: 250n,
          trainingTime: 200n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 5000000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, U_Housing: 100 }),
        P_Unit: {
          attack: 200n,
          defense: 125n,
          cargo: 8000n,
          speed: 300n,
          trainingTime: 200n,
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
      P_ScoreMultiplier: { value: 10n },
    },
  },
  Lithium: {
    keys: [{ [EResource.Lithium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 10n },
    },
  },
  Sulfur: {
    keys: [{ [EResource.Sulfur]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 60n },
    },
  },
  Titanium: {
    keys: [{ [EResource.Titanium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 750n },
      P_RawResource: { value: EResource.R_Titanium },
      P_ConsumesResource: { value: EResource.R_Titanium },
    },
  },
  Iridium: {
    keys: [{ [EResource.Iridium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 3000n },
      P_RawResource: { value: EResource.R_Iridium },
      P_ConsumesResource: { value: EResource.R_Iridium },
    },
  },
  Kimberlite: {
    keys: [{ [EResource.Kimberlite]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 8000n },
      P_RawResource: { value: EResource.R_Kimberlite },
      P_ConsumesResource: { value: EResource.R_Kimberlite },
    },
  },
  Platinum: {
    keys: [{ [EResource.Platinum]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 1500n },
      P_RawResource: { value: EResource.R_Platinum },
      P_ConsumesResource: { value: EResource.R_Platinum },
    },
  },
  IronPlate: {
    keys: [{ [EResource.IronPlate]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 50n },
      P_ConsumesResource: { value: EResource.Iron },
    },
  },
  PVCell: {
    keys: [{ [EResource.PVCell]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 50n },
      P_ConsumesResource: { value: EResource.Lithium },
    },
  },
  Alloy: {
    keys: [{ [EResource.Alloy]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 50n },
      P_ConsumesResource: { value: EResource.IronPlate },
    },
  },
  RocketFuel: {
    keys: [{ [EResource.RocketFuel]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 200n },
    },
  },

  Small: {
    keys: [{ [ESize.Small]: "uint8" }],
    tables: {
      P_SizeToAmount: { value: 100000n },
    },
  },

  Medium: {
    keys: [{ [ESize.Medium]: "uint8" }],
    tables: {
      P_SizeToAmount: { value: 250000n },
    },
  },

  Large: {
    keys: [{ [ESize.Large]: "uint8" }],
    tables: {
      P_SizeToAmount: { value: 500000n },
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
      P_RequiredObjectives: { objectives: encodeArray(["BuildGarage"]) },
      P_DefeatedPirates: { value: encodeArray(["BuildGarage"]) },
      P_SpawnPirateAsteroid: {
        x: -10,
        y: 22,
        units: encodeArray(["LightningCraft"]),
        unitAmounts: [20n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate"]),
        resourceAmounts: [30000n, 30000n, 25000n],
      },
      P_UnitReward: getUnitValues({ LightningCraft: 20 }),
    },
  },
  DefeatPirateBase2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase1"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase1"]) },
      P_SpawnPirateAsteroid: {
        x: -20,
        y: 10,
        units: encodeArray(["LightningCraft"]),
        unitAmounts: [20n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate", "Lithium"]),
        resourceAmounts: [50000n, 50000n, 50000n, 50000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 10 }),
    },
  },
  DefeatPirateBase3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase2"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase2"]) },
      P_SpawnPirateAsteroid: {
        x: -10,
        y: -10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [50n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate", "Lithium"]),
        resourceAmounts: [100000n, 100000n, 100000n, 100000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 50 }),
    },
  },
  DefeatPirateBase4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase3"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase3"]) },
      P_SpawnPirateAsteroid: {
        x: -12,
        y: -15,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [60n],
        resources: indexifyResourceArray(["Copper", "Iron", "IronPlate", "Lithium"]),
        resourceAmounts: [150000n, 150000n, 150000n, 150000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 50 }),
    },
  },
  DefeatPirateBase5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase4"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase4"]) },
      P_SpawnPirateAsteroid: {
        x: 12,
        y: -10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [100n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [150000n, 150000n, 150000n, 100000n, 100000n, 100000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 50 }),
    },
  },
  DefeatPirateBase6: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase5"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase5"]) },
      P_SpawnPirateAsteroid: {
        x: 16,
        y: 10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [150n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [150000n, 150000n, 150000n, 100000n, 100000n, 100000n],
      },
      P_UnitReward: getUnitValues({ MinutemanMarine: 50 }),
    },
  },
  DefeatPirateBase7: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase6"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase6"]) },
      P_SpawnPirateAsteroid: {
        x: 16,
        y: 10,
        units: encodeArray(["MinutemanMarine"]),
        unitAmounts: [250n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [250000n, 250000n, 250000n, 150000n, 150000n, 150000n],
      },
      P_UnitReward: getUnitValues({ TridentMarine: 50 }),
    },
  },
  DefeatPirateBase8: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase7"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase7"]) },
      P_SpawnPirateAsteroid: {
        x: 16,
        y: 10,
        units: encodeArray(["AnvilDrone", "MinutemanMarine"]),
        unitAmounts: [40n, 250n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [500000n, 500000n, 500000n, 300000n, 300000n, 300000n],
      },
      P_UnitReward: getUnitValues({ TridentMarine: 100 }),
    },
  },
  DefeatPirateBase9: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase8"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase8"]) },
      P_SpawnPirateAsteroid: {
        x: -3,
        y: -15,
        units: encodeArray(["AnvilDrone", "MinutemanMarine"]),
        unitAmounts: [50n, 300n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [500000n, 500000n, 500000n, 300000n, 300000n, 300000n],
      },
      P_UnitReward: getUnitValues({ AnvilDrone: 30 }),
    },
  },
  DefeatPirateBase10: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase9"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase9"]) },
      P_SpawnPirateAsteroid: {
        x: -12,
        y: 17,
        units: encodeArray(["AegisDrone", "TridentMarine"]),
        unitAmounts: [30n, 350n],
        resources: indexifyResourceArray(["Copper", "Iron", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [500000n, 500000n, 500000n, 300000n, 300000n, 300000n],
      },
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
  },
  DefeatPirateBase11: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase10"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase10"]) },
      P_SpawnPirateAsteroid: {
        x: 8,
        y: 12,
        units: encodeArray(["AegisDrone", "TridentMarine"]),
        unitAmounts: [60n, 150n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1000000n, 1000000n, 1000000n, 300000n, 300000n, 300000n],
      },
      P_UnitReward: getUnitValues({ AnvilDrone: 30, HammerDrone: 30 }),
    },
  },
  DefeatPirateBase12: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase11"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase11"]) },
      P_SpawnPirateAsteroid: {
        x: -18,
        y: -22,
        units: encodeArray(["AegisDrone"]),
        unitAmounts: [100n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1000000n, 1000000n, 1000000n, 500000n, 500000n, 500000n],
      },
      P_ResourceReward: getResourceValues({ Titanium: 50000 }),
    },
  },
  DefeatPirateBase13: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase12"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase12"]) },
      P_SpawnPirateAsteroid: {
        x: 8,
        y: 12,
        units: encodeArray(["AegisDrone"]),
        unitAmounts: [150n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1500000n, 1500000n, 1500000n, 1000000n, 1000000n, 1000000n],
      },
      P_ResourceReward: getResourceValues({ Titanium: 50000 }),
    },
  },
  DefeatPirateBase14: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase13"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase13"]) },
      P_SpawnPirateAsteroid: {
        x: 17,
        y: 12,
        units: encodeArray(["AegisDrone"]),
        unitAmounts: [200n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1500000n, 1500000n, 1500000n, 1000000n, 1000000n, 1000000n],
      },
      P_ResourceReward: getResourceValues({ Titanium: 50000, Platinum: 50000 }),
    },
  },

  DefeatPirateBase15: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase14"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase14"]) },
      P_SpawnPirateAsteroid: {
        x: -17,
        y: 12,
        units: encodeArray(["AegisDrone"]),
        unitAmounts: [250n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1500000n, 1500000n, 1500000n, 1000000n, 1000000n, 1000000n],
      },
      P_ResourceReward: getResourceValues({ Titanium: 50000, Platinum: 50000 }),
    },
  },
  DefeatPirateBase16: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase15"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase15"]) },
      P_SpawnPirateAsteroid: {
        x: -7,
        y: -9,
        units: encodeArray(["AegisDrone"]),
        unitAmounts: [300n],
        resources: indexifyResourceArray(["Iron", "Copper", "Lithium", "IronPlate", "PVCell", "Alloy"]),
        resourceAmounts: [1500000n, 1500000n, 1500000n, 1000000n, 1000000n, 1000000n],
      },
      P_ResourceReward: getResourceValues({ Titanium: 50000, Platinum: 50000 }),
    },
  },
  DefeatPirateBase17: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase16"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase16"]) },
      P_ResourceReward: getResourceValues({ Titanium: 50000, Platinum: 50000 }),
    },
  },

  BuildIronMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["IronMine"]) },
      P_ResourceReward: getResourceValues({ Iron: 10000 }),
    },
  },

  BuildCopperMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["CopperMine"]) },
      P_ResourceReward: getResourceValues({ Copper: 10000, Iron: 10000 }),
    },
  },

  BuildLithiumMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["LithiumMine"]) },
      P_ResourceReward: getResourceValues({ Lithium: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildIronPlateFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["IronPlateFactory"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 10000 }),
    },
  },

  BuildAlloyFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildCopperMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["AlloyFactory"]) },
      P_ResourceReward: getResourceValues({ Alloy: 20000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildGarage: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Garage"]) },
      P_SpawnPirateAsteroid: {
        x: -5,
        y: -7,
        units: encodeArray([]),
        unitAmounts: [],
        resources: indexifyResourceArray(["Copper", "Iron"]),
        resourceAmounts: [20000n, 20000n],
      },
      P_UnitReward: getUnitValues({ LightningCraft: 35 }),
    },
  },

  BuildWorkshop: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildGarage"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Workshop"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 50000 }),
    },
  },

  BuildPVCellFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildLithiumMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["PVCellFactory"]) },
      P_ResourceReward: getResourceValues({ PVCell: 20000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildSolarPanel: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildPVCellFactory"]) },
      P_HasBuiltBuildings: { value: encodeArray(["SolarPanel"]) },
      P_ResourceReward: getResourceValues({ Iron: 100000, Copper: 100000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildDroneFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["DroneFactory"]) },
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildHangar: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Hangar"]) },
      P_UnitReward: getUnitValues({ TridentMarine: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildStarmapper: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Starmapper"]) },
      P_UnitReward: getUnitValues({ HammerDrone: 10, AnvilDrone: 10 }),
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
      P_ProducedUnits: getUnitValues({ MiningVessel: 1 }),
      P_ResourceReward: getResourceValues({ Alloy: 100000 }),
    },

    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },

  TrainMinutemanMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 50 }),
      P_ResourceReward: getResourceValues({ IronPlate: 50000 }),
    },
  },
  TrainMinutemanMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine1"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 100 }),
      P_ResourceReward: getResourceValues({ IronPlate: 100000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainMinutemanMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine2"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 200 }),
      P_ResourceReward: getResourceValues({ IronPlate: 300000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainTridentMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 50 }),
      P_ResourceReward: getResourceValues({ Lithium: 100000 }),
    },
  },
  TrainTridentMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine1"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 100 }),
      P_ResourceReward: getResourceValues({ Lithium: 500000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainTridentMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine2"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 200 }),
      P_ResourceReward: getResourceValues({ Lithium: 1000000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainAnvilDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainAnvilDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone1"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 200000 }),
    },
  },
  TrainAnvilDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone2"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 500000 }),
    },
  },

  TrainHammerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainHammerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone1"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 500000 }),
    },
  },
  TrainHammerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone2"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 1000000 }),
    },
  },

  TrainAegisDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 20 }),
      P_ResourceReward: getResourceValues({ Alloy: 50000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  TrainAegisDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone1"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 50 }),
      P_ResourceReward: getResourceValues({ Alloy: 500000 }),
    },
  },
  TrainAegisDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone2"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 100 }),
      P_ResourceReward: getResourceValues({ Alloy: 1000000 }),
    },
  },

  TrainStingerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 20 }),
      P_ResourceReward: getResourceValues({ Iron: 500000, Copper: 500000, Lithium: 500000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  TrainStingerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone1"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 50 }),
      P_ResourceReward: getResourceValues({ Iron: 1500000, Copper: 1500000, Lithium: 1500000 }),
    },
  },
  TrainStingerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone2"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 100 }),
      P_ResourceReward: getResourceValues({ Iron: 7500000, Copper: 7500000, Lithium: 7500000 }),
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
      P_RaidedResources: getResourceValues({ Iron: 200000, Copper: 200000, Lithium: 200000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  RaidRawResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources1"]) },
      P_RaidedResources: getResourceValues({ Iron: 500000, Copper: 500000, Lithium: 500000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },
  RaidRawResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources2"]) },
      P_RaidedResources: getResourceValues({ Iron: 2500000, Copper: 2500000, Lithium: 2500000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 300 }),
    },
  },

  RaidFactoryResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ IronPlate: 200000, PVCell: 200000, Alloy: 200000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
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
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
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
      P_ResourceReward: getResourceValues({ Copper: 300000, Iron: 300000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  DestroyEnemyUnits2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits1"]) },
      P_DestroyedUnits: getUnitValues({ TridentMarine: 500 }),
      P_ResourceReward: getResourceValues({ Copper: 1000000, Lithium: 1000000 }),
    },
  },
  DestroyEnemyUnits3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits2"]) },
      P_DestroyedUnits: getUnitValues({ AnvilDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 3000000, IronPlate: 3000000 }),
    },
  },
  DestroyEnemyUnits4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits3"]) },
      P_DestroyedUnits: getUnitValues({ AegisDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 30000000, PVCell: 30000000 }),
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
      P_ResourceReward: getResourceValues({ Iron: 1000000, Copper: 1000000 }),
    },
  },
  ExpandBase4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase3"]) },
      P_RequiredExpansion: { value: 5n },
      P_ResourceReward: getResourceValues({ Iron: 2000000, Copper: 2000000 }),
    },
  },
  ExpandBase5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase4"]) },
      P_RequiredExpansion: { value: 6n },
      P_ResourceReward: getResourceValues({ Iron: 4000000, Copper: 4000000 }),
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
