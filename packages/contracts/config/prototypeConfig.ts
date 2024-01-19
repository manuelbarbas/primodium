import { Hex } from "viem";
import { config } from "../mud.config";
import {
  encodeArray,
  getPirateObjectiveResourceValues,
  getResourceValue,
  getResourceValues,
  getUnitValues,
  idsToPrototypes,
  indexifyResourceArray,
  marketplaceSupplyTable,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/prototypeGenUtils";
import { PrototypesConfig } from "../ts/prototypes/types";
import { EResource, ESize, MUDEnums } from "./enums";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32, { encodeAddress } from "./util/encodeBytes32";

const mainBaseMaxResourceUpgrades = {
  1: { Iron: 5000, Copper: 5000, IronPlate: 2500 },
  2: {
    Iron: 10000,
    Copper: 10000,
    IronPlate: 5000,
    Lithium: 10000,
    PVCell: 5000,
    Alloy: 5000,
  },
  3: {
    Iron: 25000,
    Copper: 25000,
    IronPlate: 15000,
    Lithium: 25000,
    PVCell: 15000,
    Alloy: 15000,
    Titanium: 500,
    Platinum: 500,
    Iridium: 500,
    Kimberlite: 500,
  },
  4: {
    Iron: 75000,
    Copper: 75000,
    Lithium: 75000,
    IronPlate: 50000,
    PVCell: 50000,
    Alloy: 50000,
    Titanium: 1000,
    Platinum: 1000,
    Iridium: 1000,
    Kimberlite: 1000,
  },
  5: {
    Iron: 150000,
    Copper: 150000,
    IronPlate: 100000,
    Lithium: 150000,
    PVCell: 100000,
    Alloy: 100000,
    Titanium: 3000,
    Platinum: 3000,
    Iridium: 3000,
    Kimberlite: 3000,
  },
  6: {
    Iron: 250000,
    Copper: 250000,
    IronPlate: 250000,
    Lithium: 250000,
    PVCell: 250000,
    Alloy: 250000,
    Titanium: 6000,
    Platinum: 6000,
    Iridium: 6000,
    Kimberlite: 6000,
  },
  7: {
    Iron: 750000,
    Copper: 750000,
    IronPlate: 500000,
    Lithium: 750000,
    PVCell: 500000,
    Alloy: 500000,
    Titanium: 7500,
    Platinum: 7500,
    Iridium: 7500,
    Kimberlite: 7500,
  },
  8: {
    Iron: 1500000,
    Copper: 1500000,
    IronPlate: 1250000,
    Lithium: 1500000,
    PVCell: 1250000,
    Alloy: 1250000,
    Titanium: 10000,
    Platinum: 10000,
    Iridium: 10000,
    Kimberlite: 10000,
  },
};

const storageUnitMaxResourceUpgrades = {
  1: {
    Iron: 2000,
    Copper: 2000,
    Lithium: 2000,
    IronPlate: 1000,
    PVCell: 1000,
    Alloy: 1000,
  },
  2: {
    Iron: 5000,
    Copper: 5000,
    Lithium: 5000,
    IronPlate: 2500,
    PVCell: 2500,
    Alloy: 2500,
    Titanium: 250,
    Platinum: 250,
    Iridium: 250,
    Kimberlite: 250,
  },
  3: {
    Iron: 15000,
    Copper: 15000,
    Lithium: 15000,
    IronPlate: 5000,
    PVCell: 5000,
    Alloy: 5000,
    Titanium: 500,
    Platinum: 500,
    Iridium: 500,
    Kimberlite: 500,
  },
  4: {
    Iron: 25000,
    Copper: 25000,
    Lithium: 25000,
    IronPlate: 10000,
    PVCell: 10000,
    Alloy: 10000,
    Titanium: 1000,
    Platinum: 1000,
    Iridium: 1000,
    Kimberlite: 1000,
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
        asteroidDistance: 10n,
        maxAsteroidsPerPlayer: 6n,
        asteroidChanceInv: 4n,
        unitProductionRate: 100n,
        travelTime: 10n,
        worldSpeed: 100n,
        tax: 10n, // out of 1000
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
    levels: {
      1: { Dimensions: { width: 11, height: 9 }, P_RequiredBaseLevel: { value: 1n } },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 2000 }),
        Dimensions: { width: 13, height: 11 },
        P_RequiredBaseLevel: { value: 2n },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 1500 }),
        Dimensions: { width: 17, height: 13 },
        P_RequiredBaseLevel: { value: 2n },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 15000 }),
        Dimensions: { width: 21, height: 15 },
        P_RequiredBaseLevel: { value: 3n },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 5000, Kimberlite: 1500 }),
        Dimensions: { width: 25, height: 17 },
        P_RequiredBaseLevel: { value: 4n },
      },
      6: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 15000, Kimberlite: 5000 }),
        Dimensions: { width: 29, height: 19 },
        P_RequiredBaseLevel: { value: 5n },
      },
      7: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 25000, Kimberlite: 10000 }),
        Dimensions: { width: 33, height: 23 },
        P_RequiredBaseLevel: { value: 6n },
      },
      8: {
        P_RequiredUpgradeResources: getResourceValues({ Lithium: 50000, Kimberlite: 15000 }),
        Dimensions: { width: maxRange.xBounds, height: maxRange.yBounds },
        P_RequiredBaseLevel: { value: 7n },
      },
    },
  },

  /* ------------------------------- Marketplace ------------------------------ */

  IronSupply: marketplaceSupplyTable(EResource.Iron, 1e7),
  CopperSupply: marketplaceSupplyTable(EResource.Copper, 1e7),
  LithiumSupply: marketplaceSupplyTable(EResource.Lithium, 1e7),
  TitaniumSupply: marketplaceSupplyTable(EResource.Titanium, 1),
  PlatinumSupply: marketplaceSupplyTable(EResource.Platinum, 1),
  IridiumSupply: marketplaceSupplyTable(EResource.Iridium, 1),
  IronPlateSupply: marketplaceSupplyTable(EResource.IronPlate, 1e4),
  AlloySupply: marketplaceSupplyTable(EResource.Alloy, 1e4),
  PVCellSupply: marketplaceSupplyTable(EResource.PVCell, 1e4),
  RocketFuelSupply: marketplaceSupplyTable(EResource.RocketFuel, 1e4),

  MarketplaceConfig: {
    keys: [],
    tables: {
      P_MarketplaceConfig: {
        feeThousandths: 3n,
        lock: false,
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
        P_Production: getResourceValues({ U_MaxMoves: 1 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      2: {
        P_RequiredResources: getResourceValues({ Copper: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[2]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      3: {
        P_RequiredResources: getResourceValues({ Copper: 10000, PVCell: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[3]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 2 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 25000, PVCell: 5000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[4]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 3 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 75000, PVCell: 500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[5]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 4 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 125000, Titanium: 1500, Platinum: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[6]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 5 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      7: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 5000,
          Platinum: 5000,
          Iridium: 5000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[7]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 6 }, true),
        P_UnitProdMultiplier: { value: 100n },
      },
      8: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 15000,
          Platinum: 15000,
          Iridium: 15000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseMaxResourceUpgrades[8]),
        },
        P_UnitProdTypes: { value: encodeArray(["MiningVessel"]) },
        P_Production: getResourceValues({ U_MaxMoves: 1, U_Vessel: 7 }, true),
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
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Iron: 0.25 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 1000 }),
        P_Production: getResourceValues({ Iron: 0.35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 10000 }),
        P_Production: getResourceValues({ Iron: 0.45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 30000 }),
        P_Production: getResourceValues({ Iron: 0.55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Iron: 0.65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200000 }),
        P_Production: getResourceValues({ Iron: 0.75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 500000 }),
        P_Production: getResourceValues({ Iron: 0.9 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Iron: 1.2 }),
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
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Copper: 0.25 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 1000 }),
        P_Production: getResourceValues({ Copper: 0.35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 10000 }),
        P_Production: getResourceValues({ Copper: 0.45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 30000 }),
        P_Production: getResourceValues({ Copper: 0.55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Copper: 0.65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200000 }),
        P_Production: getResourceValues({ Copper: 0.75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 500000 }),
        P_Production: getResourceValues({ Copper: 0.9 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Copper: 1.2 }),
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
      1: { P_RequiredBaseLevel: { value: 2n }, P_Production: getResourceValues({ Lithium: 0.25 }) },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 1000 }),
        P_Production: getResourceValues({ Lithium: 0.35 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 10000 }),
        P_Production: getResourceValues({ Lithium: 0.45 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 30000 }),
        P_Production: getResourceValues({ Lithium: 0.55 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 100000 }),
        P_Production: getResourceValues({ Lithium: 0.65 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 200000 }),
        P_Production: getResourceValues({ Lithium: 0.75 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 500000 }),
        P_Production: getResourceValues({ Lithium: 0.9 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 1000000 }),
        P_Production: getResourceValues({ Lithium: 1.2 }),
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
        P_RequiredResources: getResourceValues({ Copper: 200 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.2 }),
        P_Production: getResourceValues({ IronPlate: 0.08 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 2000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.3 }),
        P_Production: getResourceValues({ IronPlate: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 7500 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.4 }),
        P_Production: getResourceValues({ IronPlate: 0.17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 25000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.5 }),
        P_Production: getResourceValues({ IronPlate: 0.23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 75000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.6 }),
        P_Production: getResourceValues({ IronPlate: 0.3 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 250000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.7 }),
        P_Production: getResourceValues({ IronPlate: 0.4 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 1000000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.8 }),
        P_Production: getResourceValues({ IronPlate: 0.55 }),
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
        P_RequiredResources: getResourceValues({ Copper: 200 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.2 }),
        P_Production: getResourceValues({ Alloy: 0.08 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 2000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.3 }),
        P_Production: getResourceValues({ Alloy: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 7500 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.4 }),
        P_Production: getResourceValues({ Alloy: 0.17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 25000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.5 }),
        P_Production: getResourceValues({ Alloy: 0.23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 75000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.6 }),
        P_Production: getResourceValues({ Alloy: 0.3 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 250000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.7 }),
        P_Production: getResourceValues({ Alloy: 0.4 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 1000000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.8 }),
        P_Production: getResourceValues({ Alloy: 0.55 }),
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
        P_RequiredResources: getResourceValues({ Copper: 200 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.2 }),
        P_Production: getResourceValues({ PVCell: 0.08 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Copper: 2000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.3 }),
        P_Production: getResourceValues({ PVCell: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 7500 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.4 }),
        P_Production: getResourceValues({ PVCell: 0.17 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Copper: 25000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.5 }),
        P_Production: getResourceValues({ PVCell: 0.23 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 75000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.6 }),
        P_Production: getResourceValues({ PVCell: 0.3 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 250000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.7 }),
        P_Production: getResourceValues({ PVCell: 0.4 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 1000000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.8 }),
        P_Production: getResourceValues({ PVCell: 0.55 }),
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
        P_RequiredResources: getResourceValues({ Iron: 3000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 20000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Iron: 100000,
          U_Electricity: 500,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitMaxResourceUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Iron: 500000,
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
        P_RequiredResources: getResourceValues({ PVCell: 200 }),
        P_Production: getResourceValues({ U_Electricity: 300 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ PVCell: 4000 }),
        P_Production: getResourceValues({ U_Electricity: 600 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ PVCell: 10000 }),
        P_Production: getResourceValues({ U_Electricity: 800 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ PVCell: 25000 }),
        P_Production: getResourceValues({ U_Electricity: 800 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ PVCell: 75000 }),
        P_Production: getResourceValues({ U_Electricity: 1000 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ PVCell: 175000 }),
        P_Production: getResourceValues({ U_Electricity: 1200 }),
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
        P_RequiredResources: getResourceValues({ Iron: 200 }),
        P_Production: getResourceValues({ U_Housing: 40 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Lithium: 1500 }),
        P_Production: getResourceValues({ U_Housing: 60 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Lithium: 5000 }),
        P_Production: getResourceValues({ U_Housing: 80 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Lithium: 15000 }),
        P_Production: getResourceValues({ U_Housing: 100 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Lithium: 50000 }),
        P_Production: getResourceValues({ U_Housing: 120 }),
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
        P_RequiredResources: getResourceValues({ Lithium: 5000, U_Electricity: 100 }),
        P_Production: getResourceValues({ U_Housing: 240 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Lithium: 15000, U_Electricity: 200 }),
        P_Production: getResourceValues({ U_Housing: 370 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Lithium: 50000, U_Electricity: 300 }),
        P_Production: getResourceValues({ U_Housing: 500 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 150000, U_Electricity: 400 }),
        P_Production: getResourceValues({ U_Housing: 640 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 150000, U_Electricity: 500 }),
        P_Production: getResourceValues({ U_Housing: 800 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 2000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000, U_Electricity: 150 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000, U_Electricity: 200 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 100000, U_Electricity: 300 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 250000, U_Electricity: 400 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000000, U_Electricity: 500 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 250 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 100000, U_Electricity: 150 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 500 }),
        P_Production: getResourceValues({ U_MaxMoves: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000 }),
        P_Production: getResourceValues({ U_MaxMoves: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 2000, U_Electricity: 100 }),
        P_Production: getResourceValues({ U_Defense: 100 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Alloy: 15000,
          U_Electricity: 200,
        }),
        P_Production: getResourceValues({ U_Defense: 250 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({
          Alloy: 50000,
          U_Electricity: 300,
        }),
        P_Production: getResourceValues({ U_Defense: 750 }),
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
        P_RequiredResources: getResourceValues({ PVCell: 5000, Alloy: 5000, U_Electricity: 100 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }, true),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          PVCell: 15000,
          Alloy: 15000,
          U_Electricity: 100,
        }),

        P_Production: getResourceValues({ M_DefenseMultiplier: 10 }, true),
      },
      3: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          PVCell: 50000,
          Alloy: 50000,
          U_Electricity: 100,
        }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 15 }, true),
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
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Alloy: 1000 }),
        P_Production: getResourceValues({ U_Unraidable: 750 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Alloy: 7500, U_Electricity: 100 }),
        P_Production: getResourceValues({ U_Unraidable: 2000, U_AdvancedUnraidable: 500 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Alloy: 20000,
          U_Electricity: 15000,
        }),
        P_Production: getResourceValues({ U_Unraidable: 5000, U_AdvancedUnraidable: 1000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Alloy: 100000,
          U_Electricity: 200,
        }),
        P_Production: getResourceValues({ U_Unraidable: 10000, U_AdvancedUnraidable: 2500 }),
      },
    },
  },
  Market: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 1n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 1000 }),
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

  OrderType: {
    levels: idsToPrototypes(MUDEnums.EOrderType),
  },

  LightningCraft: {
    tables: {
      P_MaxLevel: { value: 1n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 1 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
        P_Unit: {
          attack: 120n,
          defense: 300n,
          cargo: 3000n,
          speed: 50n,
          trainingTime: 500n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 500 }),
        P_RequiredBaseLevel: { value: 4n },

        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
        P_Unit: {
          attack: 130n,
          defense: 340n,
          cargo: 5000n,
          speed: 100n,
          trainingTime: 500n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
        P_Unit: {
          attack: 140n,
          defense: 360n,
          cargo: 7000n,
          speed: 150n,
          trainingTime: 500n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
        P_Unit: {
          attack: 150n,
          defense: 380n,
          cargo: 10000n,
          speed: 200n,
          trainingTime: 500n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 10000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
        P_Unit: {
          attack: 160n,
          defense: 400n,
          cargo: 12000n,
          speed: 250n,
          trainingTime: 500n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 20, U_Housing: 2 }),
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
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 100, U_Housing: 3 }),
        P_Unit: {
          attack: 150n,
          defense: 500n,
          cargo: 10000n,
          speed: 70n,
          trainingTime: 1500n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 300 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 100, U_Housing: 3 }),
        P_Unit: {
          attack: 160n,
          defense: 550n,
          cargo: 12000n,
          speed: 150n,
          trainingTime: 1500n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 100, U_Housing: 3 }),
        P_Unit: {
          attack: 170n,
          defense: 600n,
          cargo: 14000n,
          speed: 200n,
          trainingTime: 1500n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 100, U_Housing: 3 }),
        P_Unit: {
          attack: 180n,
          defense: 750n,
          cargo: 16000n,
          speed: 250n,
          trainingTime: 1500n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1600 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 1, U_Housing: 3 }),
        P_Unit: {
          attack: 190n,
          defense: 800n,
          cargo: 18000n,
          speed: 300n,
          trainingTime: 1500n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 2200 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 80, PVCell: 1, U_Housing: 3 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: {
          attack: 300n,
          defense: 50n,
          cargo: 10000n,
          speed: 30n,
          trainingTime: 1200n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 300 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: {
          attack: 320n,
          defense: 60n,
          cargo: 12000n,
          speed: 50n,
          trainingTime: 1200n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: {
          attack: 350n,
          defense: 70n,
          cargo: 14000n,
          speed: 90n,
          trainingTime: 1200n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: {
          attack: 400n,
          defense: 80n,
          cargo: 16000n,
          speed: 150n,
          trainingTime: 1200n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1600 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: {
          attack: 450n,
          defense: 90n,
          cargo: 20000n,
          speed: 200n,
          trainingTime: 1200n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 2200 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 50, U_Housing: 2 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 600n,
          defense: 250n,
          cargo: 30000n,
          speed: 100n,
          trainingTime: 5000n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 900n,
          defense: 300n,
          cargo: 40000n,
          speed: 150n,
          trainingTime: 5000n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 1200n,
          defense: 350n,
          cargo: 50000n,
          speed: 200n,
          trainingTime: 5000n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 1500n,
          defense: 400n,
          cargo: 60000n,
          speed: 250n,
          trainingTime: 5000n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, U_Housing: 3 }),
        P_Unit: {
          attack: 1800n,
          defense: 450n,
          cargo: 70000n,
          speed: 300n,
          trainingTime: 5000n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 15000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 150, U_Housing: 3 }),
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
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 1500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 15000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: {
          ...getResourceValues({ Iron: 20000, PVCell: 5000 }),
          ...getResourceValues({ U_Vessel: 1 }, true),
        },
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
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
        P_Unit: {
          attack: 40n,
          defense: 20n,
          cargo: 2000n,
          speed: 20n,
          trainingTime: 100n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
        P_Unit: {
          attack: 60n,
          defense: 30n,
          cargo: 3000n,
          speed: 50n,
          trainingTime: 100n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
        P_Unit: {
          attack: 80n,
          defense: 40n,
          cargo: 4000n,
          speed: 150n,
          trainingTime: 100n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
        P_Unit: {
          attack: 100n,
          defense: 50n,
          cargo: 5000n,
          speed: 200n,
          trainingTime: 100n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
        P_Unit: {
          attack: 120n,
          defense: 60n,
          cargo: 6000n,
          speed: 250n,
          trainingTime: 100n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 15000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 100, U_Housing: 1 }),
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
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
        P_Unit: {
          attack: 80n,
          defense: 100n,
          cargo: 3000n,
          speed: 50n,
          trainingTime: 200n,
        },
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
        P_Unit: {
          attack: 100n,
          defense: 105n,
          cargo: 4000n,
          speed: 100n,
          trainingTime: 200n,
        },
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 5000 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
        P_Unit: {
          attack: 120n,
          defense: 110n,
          cargo: 5000n,
          speed: 150n,
          trainingTime: 200n,
        },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
        P_Unit: {
          attack: 140n,
          defense: 115n,
          cargo: 6000n,
          speed: 200n,
          trainingTime: 200n,
        },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 25000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
        P_Unit: {
          attack: 160n,
          defense: 120n,
          cargo: 7000n,
          speed: 250n,
          trainingTime: 200n,
        },
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 50000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 50, U_Housing: 1 }),
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
  Titanium: {
    keys: [{ [EResource.Titanium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 750n },
    },
  },
  Iridium: {
    keys: [{ [EResource.Iridium]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 3000n },
    },
  },
  Kimberlite: {
    keys: [{ [EResource.Kimberlite]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 8000n },
    },
  },
  Platinum: {
    keys: [{ [EResource.Platinum]: "uint8" }],
    tables: {
      P_ScoreMultiplier: { value: 1500n },
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
      P_ConsumesResource: { value: EResource.Copper },
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
      P_ResourceReward: getResourceValues({ Iron: 3000 }),
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
        ...getPirateObjectiveResourceValues({ Iron: 300, Copper: 300, IronPlate: 250 }),
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
        units: encodeArray(["LightningCraft", "MinutemanMarine"]),
        unitAmounts: [40n, 20n],
        ...getPirateObjectiveResourceValues({ Copper: 500, Iron: 500, IronPlate: 500, Lithium: 500 }),
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
        ...getPirateObjectiveResourceValues({ Copper: 1000, Iron: 1000, IronPlate: 1000, Lithium: 1000 }),
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
        ...getPirateObjectiveResourceValues({ Copper: 1500, Iron: 1500, IronPlate: 1500, Lithium: 1500 }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 1500,
          Iron: 1500,
          Lithium: 1500,
          IronPlate: 1000,
          PVCell: 1000,
          Alloy: 1000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 1500,
          Iron: 1500,
          Lithium: 1500,
          IronPlate: 1000,
          PVCell: 1000,
          Alloy: 1000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 2500,
          Iron: 2500,
          Lithium: 2500,
          IronPlate: 1500,
          PVCell: 1500,
          Alloy: 1500,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 5000,
          Iron: 5000,
          Lithium: 5000,
          IronPlate: 3000,
          PVCell: 3000,
          Alloy: 3000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 5000,
          Iron: 5000,
          Lithium: 5000,
          IronPlate: 3000,
          PVCell: 3000,
          Alloy: 3000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 5000,
          Iron: 5000,
          Lithium: 5000,
          IronPlate: 3000,
          PVCell: 3000,
          Alloy: 3000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 10000,
          Iron: 10000,
          Lithium: 10000,
          IronPlate: 3000,
          PVCell: 3000,
          Alloy: 3000,
        }),
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
        ...getPirateObjectiveResourceValues({
          Copper: 10000,
          Iron: 10000,
          Lithium: 10000,
          IronPlate: 5000,
          PVCell: 5000,
          Alloy: 5000,
        }),
      },
      P_ResourceReward: getResourceValues({ Titanium: 500 }),
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
        ...getPirateObjectiveResourceValues({
          Iron: 15000,
          Copper: 15000,
          Lithium: 15000,
          IronPlate: 10000,
          PVCell: 10000,
          Alloy: 10000,
        }),
      },
      P_ResourceReward: getResourceValues({ Titanium: 500 }),
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
        ...getPirateObjectiveResourceValues({
          Iron: 15000,
          Copper: 15000,
          Lithium: 15000,
          IronPlate: 10000,
          PVCell: 10000,
          Alloy: 10000,
        }),
      },
      P_ResourceReward: getResourceValues({ Titanium: 500, Platinum: 500 }),
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
        ...getPirateObjectiveResourceValues({
          Iron: 15000,
          Copper: 15000,
          Lithium: 15000,
          IronPlate: 10000,
          PVCell: 10000,
          Alloy: 10000,
        }),
      },
      P_ResourceReward: getResourceValues({ Titanium: 500, Platinum: 500 }),
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
        ...getPirateObjectiveResourceValues({
          Iron: 15000,
          Copper: 15000,
          Lithium: 15000,
          IronPlate: 10000,
          PVCell: 10000,
          Alloy: 10000,
        }),
      },
      P_ResourceReward: getResourceValues({ Titanium: 500, Platinum: 500 }),
    },
  },
  DefeatPirateBase17: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DefeatPirateBase16"]) },
      P_DefeatedPirates: { value: encodeArray(["DefeatPirateBase16"]) },
      P_ResourceReward: getResourceValues({ Titanium: 500, Platinum: 500 }),
    },
  },

  BuildIronMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["IronMine"]) },
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
  },

  BuildCopperMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["CopperMine"]) },
      P_ResourceReward: getResourceValues({ Copper: 100, Iron: 100 }),
    },
  },

  BuildLithiumMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["LithiumMine"]) },
      P_ResourceReward: getResourceValues({ Lithium: 500 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildIronPlateFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["IronPlateFactory"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 100 }),
    },
  },

  BuildAlloyFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildCopperMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["AlloyFactory"]) },
      P_ResourceReward: getResourceValues({ Alloy: 200 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildGarage: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Garage"]) },
      P_SpawnPirateAsteroid: {
        x: -10,
        y: -12,
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
      P_ResourceReward: getResourceValues({ IronPlate: 500 }),
    },
  },

  BuildPVCellFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildLithiumMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["PVCellFactory"]) },
      P_ResourceReward: getResourceValues({ PVCell: 200 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildSolarPanel: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildPVCellFactory"]) },
      P_HasBuiltBuildings: { value: encodeArray(["SolarPanel"]) },
      P_ResourceReward: getResourceValues({ Iron: 1000, Copper: 1000 }),
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
      P_ResourceReward: getResourceValues({ Alloy: 1000 }),
    },

    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },

  TrainMinutemanMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 50 }),
      P_ResourceReward: getResourceValues({ IronPlate: 500 }),
    },
  },
  TrainMinutemanMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine1"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 100 }),
      P_ResourceReward: getResourceValues({ IronPlate: 1000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainMinutemanMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainMinutemanMarine2"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 200 }),
      P_ResourceReward: getResourceValues({ IronPlate: 3000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainTridentMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 50 }),
      P_ResourceReward: getResourceValues({ Lithium: 1000 }),
    },
  },
  TrainTridentMarine2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine1"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 100 }),
      P_ResourceReward: getResourceValues({ Lithium: 5000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainTridentMarine3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainTridentMarine2"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 200 }),
      P_ResourceReward: getResourceValues({ Lithium: 10000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainAnvilDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 500 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainAnvilDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone1"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 2000 }),
    },
  },
  TrainAnvilDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAnvilDrone2"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 5000 }),
    },
  },

  TrainHammerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 20 }),
      P_ResourceReward: getResourceValues({ PVCell: 500 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  TrainHammerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone1"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 50 }),
      P_ResourceReward: getResourceValues({ PVCell: 5000 }),
    },
  },
  TrainHammerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainHammerDrone2"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 100 }),
      P_ResourceReward: getResourceValues({ PVCell: 10000 }),
    },
  },

  TrainAegisDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 20 }),
      P_ResourceReward: getResourceValues({ Alloy: 500 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  TrainAegisDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone1"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 50 }),
      P_ResourceReward: getResourceValues({ Alloy: 5000 }),
    },
  },
  TrainAegisDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainAegisDrone2"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 100 }),
      P_ResourceReward: getResourceValues({ Alloy: 10000 }),
    },
  },

  TrainStingerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 20 }),
      P_ResourceReward: getResourceValues({ Iron: 5000, Copper: 5000, Lithium: 5000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },
  TrainStingerDrone2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone1"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 50 }),
      P_ResourceReward: getResourceValues({ Iron: 15000, Copper: 15000, Lithium: 15000 }),
    },
  },
  TrainStingerDrone3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["TrainStingerDrone2"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 100 }),
      P_ResourceReward: getResourceValues({ Iron: 75000, Copper: 75000, Lithium: 75000 }),
    },
  },

  MineTitanium1: {
    tables: {
      P_ProducedResources: getResourceValues({ Titanium: 1000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineTitanium2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineTitanium1"]) },
      P_ProducedResources: getResourceValues({ Titanium: 3000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 100 }),
    },
  },
  MineTitanium3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineTitanium2"]) },
      P_ProducedResources: getResourceValues({ Titanium: 10000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 250 }),
    },
  },

  MinePlatinum1: {
    tables: {
      P_ProducedResources: getResourceValues({ Platinum: 1000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MinePlatinum2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MinePlatinum1"]) },
      P_ProducedResources: getResourceValues({ Platinum: 3000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },
  MinePlatinum3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MinePlatinum2"]) },
      P_ProducedResources: getResourceValues({ Platinum: 10000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },

  MineIridium1: {
    tables: {
      P_ProducedResources: getResourceValues({ Iridium: 1000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineIridium2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineIridium1"]) },
      P_ProducedResources: getResourceValues({ Iridium: 3000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 100 }),
    },
  },
  MineIridium3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineIridium2"]) },
      P_ProducedResources: getResourceValues({ Iridium: 10000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 250 }),
    },
  },

  MineKimberlite1: {
    tables: {
      P_ProducedResources: getResourceValues({ Kimberlite: 1000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 15, HammerDrone: 15, AegisDrone: 15 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },
  MineKimberlite2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineKimberlite1"]) },
      P_ProducedResources: getResourceValues({ Kimberlite: 3000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 50, HammerDrone: 50, AegisDrone: 50 }),
    },
  },
  MineKimberlite3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["MineKimberlite2"]) },
      P_ProducedResources: getResourceValues({ Kimberlite: 10000 }),
      P_UnitReward: getUnitValues({ AnvilDrone: 100, HammerDrone: 100, AegisDrone: 100 }),
    },
  },

  RaidRawResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ Iron: 2000, Copper: 2000, Lithium: 2000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  RaidRawResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources1"]) },
      P_RaidedResources: getResourceValues({ Iron: 5000, Copper: 5000, Lithium: 5000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 100 }),
    },
  },
  RaidRawResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidRawResources2"]) },
      P_RaidedResources: getResourceValues({ Iron: 25000, Copper: 25000, Lithium: 25000 }),
      P_UnitReward: getUnitValues({ HammerDrone: 300 }),
    },
  },

  RaidFactoryResources1: {
    tables: {
      P_RaidedResources: getResourceValues({ IronPlate: 2000, PVCell: 2000, Alloy: 2000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 30 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  RaidFactoryResources2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidFactoryResources1"]) },
      P_RaidedResources: getResourceValues({ IronPlate: 5000, PVCell: 5000, Alloy: 5000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 100 }),
    },
  },
  RaidFactoryResources3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["RaidFactoryResources2"]) },
      P_RaidedResources: getResourceValues({ IronPlate: 25000, PVCell: 25000, Alloy: 25000 }),
      P_UnitReward: getUnitValues({ AegisDrone: 300 }),
    },
  },

  DestroyEnemyUnits1: {
    tables: {
      P_DestroyedUnits: getUnitValues({ MinutemanMarine: 500 }),
      P_ResourceReward: getResourceValues({ Copper: 3000, Iron: 3000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  DestroyEnemyUnits2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits1"]) },
      P_DestroyedUnits: getUnitValues({ TridentMarine: 500 }),
      P_ResourceReward: getResourceValues({ Copper: 10000, Lithium: 10000 }),
    },
  },
  DestroyEnemyUnits3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits2"]) },
      P_DestroyedUnits: getUnitValues({ AnvilDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 30000, IronPlate: 30000 }),
    },
  },
  DestroyEnemyUnits4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits3"]) },
      P_DestroyedUnits: getUnitValues({ AegisDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 300000, PVCell: 300000 }),
    },
  },
  DestroyEnemyUnits5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["DestroyEnemyUnits4"]) },
      P_DestroyedUnits: getUnitValues({ StingerDrone: 300 }),
      P_ResourceReward: getResourceValues({ Copper: 500000, Titanium: 3000, Platinum: 3000 }),
    },
  },

  // todo: expand base logic
  ExpandBase1: {
    tables: {
      P_RequiredExpansion: { value: 2n },
      P_ResourceReward: getResourceValues({ Iron: 2000 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  ExpandBase2: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase1"]) },
      P_RequiredExpansion: { value: 3n },
      P_ResourceReward: getResourceValues({ Iron: 5000, Copper: 5000 }),
    },
  },
  ExpandBase3: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase2"]) },
      P_RequiredExpansion: { value: 4n },
      P_ResourceReward: getResourceValues({ Iron: 10000, Copper: 10000 }),
    },
  },
  ExpandBase4: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase3"]) },
      P_RequiredExpansion: { value: 5n },
      P_ResourceReward: getResourceValues({ Iron: 20000, Copper: 20000 }),
    },
  },
  ExpandBase5: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase4"]) },
      P_RequiredExpansion: { value: 6n },
      P_ResourceReward: getResourceValues({ Iron: 40000, Copper: 40000 }),
    },
  },
  ExpandBase6: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["ExpandBase5"]) },
      P_RequiredExpansion: { value: 7n },
      P_ResourceReward: getResourceValues({ Iron: 100000, Copper: 100000 }),
    },
  },
};
