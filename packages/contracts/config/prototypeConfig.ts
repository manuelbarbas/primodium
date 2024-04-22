import { Hex } from "viem";
import { worldInput } from "../mud.config";
import {
  encodeArray,
  getPUnitData,
  getResourceValue,
  getResourceValues,
  getUnitValues,
  idsToPrototypes,
  marketplaceSupplyTable,
  upgradesByLevel,
  upgradesToList,
} from "../ts/prototypes/prototypeGenUtils";
import { PrototypesConfig } from "../ts/prototypes/types";
import { SCALE } from "./constants";
import { EResource, MUDEnums } from "./enums";
import {
  mainBaseStorageUpgrades,
  samSiteStorageUpgrades,
  storageUnitStorageUpgrades,
  wormholeBaseStorageUpgrades,
} from "./storageUpgrades";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32, { encodeAddress } from "./util/encodeBytes32";

const maxRange = { xBounds: 37, yBounds: 25 };

const colonySlotsConfigResourceValues = getResourceValues({ Copper: 10000, Lithium: 5000 }); // Order impacts Installment payment index

export const prototypeConfig: PrototypesConfig<(typeof worldInput)["tables"]> = {
  /* ---------------------------------- World --------------------------------- */
  World: {
    keys: [],
    tables: {
      P_AllianceConfig: { maxAllianceMembers: 20n },
      P_GracePeriod: { asteroid: 60n * 60n * 12n, fleet: 60n * 30n },
      P_Asteroid: maxRange,
      P_GameConfig: {
        admin: encodeAddress("0"),
        asteroidDistance: 10n,
        maxAsteroidsPerPlayer: 6n,
        asteroidChanceInv: 2n,
        unitProductionRate: 100n,
        travelTime: 10n,
        worldSpeed: 100n,
        unitDeathLimit: BigInt(1e18),
      },

      P_WormholeAsteroidConfig: {
        wormholeAsteroidSlot: 0n,
        maxLevel: 1n,
        mapId: 6,
        primodium: 0n * BigInt(SCALE),
      },

      // Must add up to 100
      P_AsteroidProbabilityConfig: {
        common1: 30n,
        common2: 15n,
        eliteMicro: 5n,
        eliteSmall: 25n,
        eliteMedium: 15n,
        eliteLarge: 10n,
      },

      P_ColonyShipConfig: {
        decryption: 10n * BigInt(SCALE),
        cooldownExtension: 60n * 1n, // one hour
      },

      P_UnitPrototypes: {
        value: MUDEnums.EUnit.reduce(
          (prev: Hex[], unit) => (unit == "NULL" || unit == "LENGTH" ? prev : [...prev, encodeBytes32(unit)]),
          []
        ),
      },
      P_Transportables: {
        value: [
          EResource.Iron,
          EResource.Copper,
          EResource.Lithium,
          EResource.IronPlate,
          EResource.PVCell,
          EResource.Alloy,
          EResource.Titanium,
          EResource.Platinum,
          EResource.Iridium,
          EResource.Kimberlite,
        ],
      },
    },
  },

  Wormhole: {
    keys: [],
    tables: {
      P_WormholeConfig: {
        initTime: BigInt(Math.round(Date.now() / 1000)),
        turnDuration: 69420n,
        cooldown: 6n * 60n * 60n,
      },
      Wormhole: {
        resource: EResource.Iron,
        nextResource: EResource.Copper,
        turn: 0n,
        hash: encodeBytes32("i love wormholes"),
      },
    },
  },

  Conquest: {
    keys: [],
    tables: {
      P_ConquestConfig: {
        holdTime: 6n * 60n * 60n,
        // spawn a shard asteroid every <shardAsteroidSpawnFrequency> players, starting at the <shardAsteroidOffset>th player
        shardAsteroidSpawnFrequency: 100n,
        shardAsteroidSpawnOffset: 25n,
        // limit shard asteroids to <maxShardAsteroids>
        maxShardAsteroids: 10n,
        shardAsteroidPoints: 50n * BigInt(SCALE),
        shardAsteroidLifeSpan: 6n * 60n * 60n,
        shardAsteroidEncryption: 15n * BigInt(SCALE),
        shardAsteroidEncryptionRegen: BigInt(Math.round(0.00056 * SCALE)),
      },
    },
  },

  Building: {
    levels: idsToPrototypes(MUDEnums.EBuilding),
  },

  Expansion: {
    tables: { P_MaxLevel: { value: 8n } },
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

  IronSupply: marketplaceSupplyTable(EResource.Iron, 1e4),
  CopperSupply: marketplaceSupplyTable(EResource.Copper, 1e4),
  LithiumSupply: marketplaceSupplyTable(EResource.Lithium, 1e4),
  TitaniumSupply: marketplaceSupplyTable(EResource.Titanium, 1),
  PlatinumSupply: marketplaceSupplyTable(EResource.Platinum, 1),
  IridiumSupply: marketplaceSupplyTable(EResource.Iridium, 1),
  IronPlateSupply: marketplaceSupplyTable(EResource.IronPlate, 1e2),
  AlloySupply: marketplaceSupplyTable(EResource.Alloy, 1e2),
  PVCellSupply: marketplaceSupplyTable(EResource.PVCell, 1e2),

  MarketplaceConfig: {
    keys: [],
    tables: {
      P_MarketplaceConfig: {
        feeThousandths: 100n,
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
        parentEntity: encodeBytes32(0),
      },
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 8n },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[1]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      2: {
        P_RequiredResources: getResourceValues({ Copper: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[2]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      3: {
        P_RequiredResources: getResourceValues({ Copper: 10000, PVCell: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[3]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 25000, PVCell: 5000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[4]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 75000, PVCell: 500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[5]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 125000, Titanium: 1500, Platinum: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[6]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      7: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 5000,
          Platinum: 5000,
          Iridium: 5000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[7]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      8: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 15000,
          Platinum: 15000,
          Iridium: 15000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[8]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
    },
  },
  ...upgradesByLevel("MainBase", mainBaseStorageUpgrades),

  WormholeBase: {
    tables: {
      P_Blueprint: { value: getBlueprint(7, 5) },
      Position: {
        x: Math.floor(maxRange.xBounds / 2) + 3,
        y: Math.floor(maxRange.yBounds / 2) + 2,
        parentEntity: encodeBytes32(0),
      },
      P_MaxLevel: { value: 8n },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[1]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      2: {
        P_RequiredResources: getResourceValues({ Copper: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[2]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      3: {
        P_RequiredResources: getResourceValues({ Copper: 10000, PVCell: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[3]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      4: {
        P_RequiredResources: getResourceValues({ Copper: 25000, PVCell: 5000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[4]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      5: {
        P_RequiredResources: getResourceValues({ Copper: 75000, PVCell: 500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[5]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      6: {
        P_RequiredResources: getResourceValues({ Copper: 125000, Titanium: 1500, Platinum: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[6]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      7: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 5000,
          Platinum: 5000,
          Iridium: 5000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[7]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
      8: {
        P_RequiredResources: getResourceValues({
          Copper: 250000,
          Titanium: 15000,
          Platinum: 15000,
          Iridium: 15000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[8]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.00056, R_HP: 0.001 }),
      },
    },
  },
  ...upgradesByLevel("WormholeBase", wormholeBaseStorageUpgrades),

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
  KimberliteMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 3n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Kimberlite") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 5000, Copper: 5000 }),
        P_RequiredBaseLevel: { value: 2n },
        P_Production: getResourceValues({ Kimberlite: 0.01 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 25000, Lithium: 10000 }),
        P_Production: getResourceValues({ Kimberlite: 0.05 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Lithium: 20000 }),
        P_Production: getResourceValues({ Kimberlite: 0.1 }),
      },
    },
  },
  IridiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 3n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iridium") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 5000, Copper: 5000 }),
        P_RequiredBaseLevel: { value: 2n },
        P_Production: getResourceValues({ Iridium: 0.01 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 25000, Lithium: 10000 }),
        P_Production: getResourceValues({ Iridium: 0.05 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Lithium: 20000 }),
        P_Production: getResourceValues({ Iridium: 0.1 }),
      },
    },
  },
  PlatinumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 3n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Platinum") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 5000, Copper: 5000 }),
        P_RequiredBaseLevel: { value: 2n },
        P_Production: getResourceValues({ Platinum: 0.01 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 25000, Lithium: 10000 }),
        P_Production: getResourceValues({ Platinum: 0.05 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Lithium: 20000 }),
        P_Production: getResourceValues({ Platinum: 0.1 }),
      },
    },
  },
  TitaniumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 3n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Titanium") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 5000, Copper: 5000 }),
        P_RequiredBaseLevel: { value: 2n },
        P_Production: getResourceValues({ Titanium: 0.01 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 25000, Lithium: 10000 }),
        P_Production: getResourceValues({ Titanium: 0.05 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Lithium: 20000 }),
        P_Production: getResourceValues({ Titanium: 0.1 }),
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
          value: upgradesToList(storageUnitStorageUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 20000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Iron: 100000,
          U_Electricity: 50,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          Iron: 500000,
          U_Electricity: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[3]),
        },
      },
    },
  },
  ...upgradesByLevel("StorageUnit", storageUnitStorageUpgrades),
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
        P_UnitProdMultiplier: { value: 250n },
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
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 100000, U_Electricity: 150 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
    },
  },

  Shipyard: {
    tables: {
      P_Blueprint: { value: getBlueprint(6, 4) },
      P_MaxLevel: { value: 4n },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ IronPlate: 2500, Alloy: 2500, PVCell: 2500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 7500, Alloy: 7500, PVCell: 7500 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 17500, Alloy: 17500, PVCell: 17500 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 27500, Alloy: 27500, PVCell: 27500 }),
        P_UnitProdMultiplier: { value: 300n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
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
        P_Production: getResourceValues({ U_MaxFleets: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 10000 }),
        P_Production: getResourceValues({ U_MaxFleets: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 25000 }),
        P_Production: getResourceValues({ U_MaxFleets: 3 }),
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
        P_Production: getResourceValues({ U_Defense: 1500, R_HP: 0.1 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({
          Alloy: 15000,
          U_Electricity: 200,
        }),

        P_Production: getResourceValues({ U_Defense: 2500, R_HP: 0.25 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({
          Alloy: 40000,
          U_Electricity: 300,
        }),

        P_Production: getResourceValues({ U_Defense: 5000, R_HP: 0.75 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
    },
  },
  ...upgradesByLevel("SAM", samSiteStorageUpgrades),

  ShieldGenerator: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 3n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ PVCell: 10000, U_Electricity: 100 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({
          PVCell: 30000,
          U_Electricity: 100,
        }),

        P_Production: getResourceValues({ M_DefenseMultiplier: 10 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          PVCell: 50000,
          Kimberlite: 5000,
          U_Electricity: 100,
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
          U_Electricity: 200,
        }),
        P_Production: getResourceValues({ U_Unraidable: 5000, U_AdvancedUnraidable: 1000 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({
          Alloy: 100000,
          U_Electricity: 300,
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
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Lithium: 1000 }),
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
      [MUDEnums.EResource.indexOf("U_MaxFleets")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Defense")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("M_DefenseMultiplier")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_Unraidable")]: { P_IsUtility: { value: true } },
      [MUDEnums.EResource.indexOf("U_AdvancedUnraidable")]: { P_IsUtility: { value: true } },
    },
  },

  Recoverables: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("R_HP")]: { P_IsRecoverable: { value: true } },
      [MUDEnums.EResource.indexOf("R_Encryption")]: { P_IsRecoverable: { value: true } },
    },
  },

  IsAdvancedResource: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("Iron")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Copper")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Lithium")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Titanium")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Iridium")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Kimberlite")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Platinum")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("IronPlate")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("Alloy")]: { P_IsResource: { isResource: true, isAdvanced: false } },
      [MUDEnums.EResource.indexOf("PVCell")]: { P_IsResource: { isResource: true, isAdvanced: false } },

      [MUDEnums.EResource.indexOf("Titanium")]: { P_IsResource: { isResource: true, isAdvanced: true } },
      [MUDEnums.EResource.indexOf("Platinum")]: { P_IsResource: { isResource: true, isAdvanced: true } },
      [MUDEnums.EResource.indexOf("Iridium")]: { P_IsResource: { isResource: true, isAdvanced: true } },
      [MUDEnums.EResource.indexOf("Kimberlite")]: { P_IsResource: { isResource: true, isAdvanced: true } },
    },
  },

  ColonySlotsConfig: {
    keys: [],
    tables: {
      P_ColonySlotsConfig: {
        resources: colonySlotsConfigResourceValues.resources, // Order impacts Installment payment index
        amounts: colonySlotsConfigResourceValues.amounts,
        multiplier: 4n,
      },
    },
  },

  /* --------------------------------- Units --------------------------------- */
  Unit: {
    levels: idsToPrototypes(MUDEnums.EUnit),
  },

  FleetStance: {
    levels: idsToPrototypes(MUDEnums.EFleetStance),
  },

  LightningCraft: {
    tables: {
      P_MaxLevel: { value: 0n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 600,
          trainingTime: 600,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 720,
          trainingTime: 600,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 840,
          trainingTime: 600,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 960,
          trainingTime: 600,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 1080,
          trainingTime: 600,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Kimberlite: 100, PVCell: 500, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 10,
          speed: 1200,
          trainingTime: 600,
        }),
      },
    },
  },

  AnvilDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 300,
          attack: 120,
          defense: 300,
          cargo: 60,
          speed: 100,
          trainingTime: 600,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 330,
          attack: 120,
          defense: 330,
          cargo: 60,
          speed: 110,
          trainingTime: 600,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 360,
          attack: 120,
          defense: 360,
          cargo: 60,
          speed: 120,
          trainingTime: 600,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 390,
          attack: 120,
          defense: 390,
          cargo: 60,
          speed: 130,
          trainingTime: 600,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 10000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 420,
          attack: 120,
          defense: 420,
          cargo: 60,
          speed: 140,
          trainingTime: 600,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Alloy: 200, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 450,
          attack: 120,
          defense: 450,
          cargo: 60,
          speed: 150,
          trainingTime: 600,
        }),
      },
    },
  },
  AegisDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 800,
          attack: 100,
          defense: 800,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 960,
          attack: 100,
          defense: 960,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 1120,
          attack: 100,
          defense: 1120,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 1280,
          attack: 100,
          defense: 1280,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 1440,
          attack: 100,
          defense: 1440,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ U_Housing: 3, Alloy: 800, PVCell: 100 }),
        P_Unit: getPUnitData({
          hp: 1600,
          attack: 100,
          defense: 1600,
          cargo: 30,
          speed: 30,
          trainingTime: 1800,
        }),
      },
    },
  },
  HammerDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 250,
          attack: 250,
          defense: 50,
          cargo: 80,
          speed: 100,
          trainingTime: 600,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 275,
          attack: 275,
          defense: 50,
          cargo: 80,
          speed: 110,
          trainingTime: 600,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 300,
          attack: 300,
          defense: 50,
          cargo: 80,
          speed: 120,
          trainingTime: 600,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 5000 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 325,
          attack: 325,
          defense: 50,
          cargo: 80,
          speed: 130,
          trainingTime: 600,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 10000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 350,
          attack: 350,
          defense: 50,
          cargo: 80,
          speed: 140,
          trainingTime: 600,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ U_Housing: 2, IronPlate: 200, PVCell: 50 }),
        P_Unit: getPUnitData({
          hp: 375,
          attack: 375,
          defense: 50,
          cargo: 80,
          speed: 150,
          trainingTime: 600,
        }),
      },
    },
  },
  StingerDrone: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 600,
          attack: 600,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 720,
          attack: 720,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 1500 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 840,
          attack: 840,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 960,
          attack: 960,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 1080,
          attack: 1080,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, PVCell: 100, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 1200,
          attack: 1200,
          defense: 150,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
    },
  },
  ColonyShip: {
    tables: {
      P_MaxLevel: { value: 0n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ Alloy: 10000 }),
        P_RequiredBaseLevel: { value: 3n },
        P_Unit: getPUnitData({
          hp: 2000,
          attack: 20,
          defense: 50,
          cargo: 2000,
          speed: 100,
          trainingTime: 43200,
        }),
      },
    },
  },
  Droid: {
    tables: {
      P_MaxLevel: { value: 0n },
    },
    levels: {
      0: {
        P_Unit: getPUnitData({
          hp: 100,
          attack: 0,
          defense: 100,
          cargo: 0,
          speed: 1,
          trainingTime: 100000,
        }),
      },
    },
  },
  MinutemanMarine: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 40,
          speed: 250,
          trainingTime: 120,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 44,
          speed: 275,
          trainingTime: 110,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 48,
          speed: 300,
          trainingTime: 100,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 52,
          speed: 325,
          trainingTime: 90,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 56,
          speed: 350,
          trainingTime: 80,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 100 }),
        P_Unit: getPUnitData({
          hp: 40,
          attack: 35,
          defense: 40,
          cargo: 60,
          speed: 375,
          trainingTime: 70,
        }),
      },
    },
  },
  TridentMarine: {
    tables: {
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 80,
          attack: 80,
          defense: 80,
          cargo: 80,
          speed: 150,
          trainingTime: 200,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 500 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 88,
          attack: 88,
          defense: 80,
          cargo: 88,
          speed: 150,
          trainingTime: 200,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 1500 }),
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 96,
          attack: 96,
          defense: 80,
          cargo: 96,
          speed: 150,
          trainingTime: 200,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 5000 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 104,
          attack: 104,
          defense: 80,
          cargo: 104,
          speed: 150,
          trainingTime: 200,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 112,
          attack: 112,
          defense: 80,
          cargo: 112,
          speed: 150,
          trainingTime: 200,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 25000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ U_Housing: 1, Lithium: 30, IronPlate: 50 }),
        P_Unit: getPUnitData({
          hp: 120,
          attack: 120,
          defense: 80,
          cargo: 120,
          speed: 150,
          trainingTime: 200,
        }),
      },
    },
  },

  ScoreMultipliers: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("Iron")]: { P_ScoreMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Copper")]: { P_ScoreMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Lithium")]: { P_ScoreMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Titanium")]: { P_ScoreMultiplier: { value: 75n } },
      [MUDEnums.EResource.indexOf("Iridium")]: { P_ScoreMultiplier: { value: 300n } },
      [MUDEnums.EResource.indexOf("Kimberlite")]: { P_ScoreMultiplier: { value: 800n } },
      [MUDEnums.EResource.indexOf("Platinum")]: { P_ScoreMultiplier: { value: 150n } },
      [MUDEnums.EResource.indexOf("IronPlate")]: { P_ScoreMultiplier: { value: 5n } },
      [MUDEnums.EResource.indexOf("PVCell")]: { P_ScoreMultiplier: { value: 5n } },
      [MUDEnums.EResource.indexOf("Alloy")]: { P_ScoreMultiplier: { value: 5n } },
    },
  },

  /* ------------------------------- Objectives ------------------------------- */
  Objectives: {
    levels: idsToPrototypes(MUDEnums.EObjectives),
  },

  UpgradeMainBase: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2n } },
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
      P_ResourceReward: getResourceValues({ Copper: 100 }),
    },
  },

  BuildLithiumMine: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["LithiumMine"]) },
      P_ResourceReward: getResourceValues({ Lithium: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildIronPlateFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["IronPlateFactory"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 10 }),
    },
  },

  BuildAlloyFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildCopperMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["AlloyFactory"]) },
      P_ResourceReward: getResourceValues({ Alloy: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildGarage: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildIronMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Garage"]) },
      P_UnitReward: getUnitValues({ MinutemanMarine: 1 }),
    },
  },

  BuildWorkshop: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildGarage"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Workshop"]) },
      P_UnitReward: getUnitValues({ TridentMarine: 1 }),
    },
  },

  BuildPVCellFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildLithiumMine"]) },
      P_HasBuiltBuildings: { value: encodeArray(["PVCellFactory"]) },
      P_ResourceReward: getResourceValues({ PVCell: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildStorageUnit: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["StorageUnit"]) },
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildSolarPanel: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildPVCellFactory"]) },
      P_HasBuiltBuildings: { value: encodeArray(["SolarPanel"]) },
      P_ResourceReward: getResourceValues({ Lithium: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildDroneFactory: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["DroneFactory"]) },
      P_UnitReward: getUnitValues({ HammerDrone: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },
  BuildHangar: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildSolarPanel"]) },
      P_HasBuiltBuildings: { value: encodeArray(["Hangar"]) },
      P_UnitReward: getUnitValues({ AnvilDrone: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildStarmapper: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Starmapper"]) },
      P_UnitReward: getUnitValues({ StingerDrone: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildSAMLauncher: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["SAM"]) },
      P_ResourceReward: getResourceValues({ Copper: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildVault: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Vault"]) },
      P_UnitReward: getUnitValues({ LightningCraft: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  BuildShipyard: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Shipyard"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildShieldGenerator: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["ShieldGenerator"]) },
      P_UnitReward: getUnitValues({ AegisDrone: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildMarket: {
    tables: {
      P_HasBuiltBuildings: { value: encodeArray(["Market"]) },
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 4n } } },
  },

  TrainMinutemanMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ MinutemanMarine: 25 }),
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
  },

  TrainTridentMarine1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ TridentMarine: 25 }),
      P_ResourceReward: getResourceValues({ Copper: 100 }),
    },
  },

  TrainLightningShip1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ LightningShip: 10 }),
      P_ResourceReward: getResourceValues({ Lithium: 100 }),
    },
  },

  TrainAnvilDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AnvilDrone: 10 }),
      P_ResourceReward: getResourceValues({ PVCell: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainHammerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ HammerDrone: 10 }),
      P_ResourceReward: getResourceValues({ PVCell: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  TrainAegisDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ AegisDrone: 10 }),
      P_ResourceReward: getResourceValues({ Alloy: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  TrainStingerDrone1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildDroneFactory"]) },
      P_ProducedUnits: getUnitValues({ StingerDrone: 10 }),
      P_ResourceReward: getResourceValues({ IronPlate: 10 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  BuildColonyShip1: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ProducedUnits: getUnitValues({ ColonyShip: 1 }),
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 3n } } },
  },

  ExpandBase1: {
    tables: {
      P_RequiredExpansion: { value: 2n },
      P_ResourceReward: getResourceValues({ Copper: 100 }),
    },
    levels: { 1: { P_RequiredBaseLevel: { value: 2n } } },
  },

  CreateFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ResourceReward: getResourceValues({ Iron: 10 }),
    },
  },

  TransferResourcesToAsteroid: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Copper: 10 }),
    },
  },

  TransferResourcesToFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Lithium: 10 }),
    },
  },

  RecallFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Iron: 10 }),
    },
  },

  LandFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Copper: 10 }),
    },
  },

  MoveFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Lithium: 10 }),
    },
  },

  BattleAsteroid: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 10 }),
    },
  },

  BattleFleet: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Alloy: 10 }),
    },
  },

  SuccessfulRaid: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ PVCell: 10 }),
    },
  },

  OpenBattleReport: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["CreateFleet"]) },
      P_ResourceReward: getResourceValues({ Iron: 10 }),
    },
  },

  UpgradeUnitType: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildWorkshop"]) },
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
  },

  BuildColonyShip: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildShipyard"]) },
      P_ResourceReward: getResourceValues({ Alloy: 10 }),
    },
  },

  DecryptAttack: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildColonyShip"]) },
      P_ResourceReward: getResourceValues({ IronPlate: 10 }),
    },
  },

  CaptureAsteroid: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildColonyShip"]) },
      P_ResourceReward: getResourceValues({ PVCell: 10 }),
    },
  },

  MarketSwap: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildMarket"]) },
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
  },

  MarketLiquidity: {
    tables: {
      P_RequiredObjectives: { objectives: encodeArray(["BuildMarket"]) },
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
  },

  JoinAlliance: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
  },
};
