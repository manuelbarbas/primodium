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

const colonySlotsConfigResourceValues = getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000 }); // Order impacts Installment payment index

export const prototypeConfig: PrototypesConfig<(typeof worldInput)["tables"]> = {
  /* ---------------------------------- World --------------------------------- */
  World: {
    keys: [],
    tables: {
      P_AllianceConfig: { maxAllianceMembers: 30n },
      P_GracePeriod: { asteroid: 60n * 60n * 48n, fleet: 60n * 30n },
      P_Asteroid: maxRange,
      P_GameConfig: {
        admin: encodeAddress("0"),
        asteroidDistance: 10n,
        maxAsteroidsPerPlayer: 6n,
        asteroidChanceInv: 2n,
        unitProductionRate: 100n,
        travelTime: 10n,
        worldSpeed: 100n,
        unitDeathLimit: 1_000_000n,
      },

      P_WormholeAsteroidConfig: {
        wormholeAsteroidSlot: 0n,
        maxLevel: 1n,
        mapId: 6,
        primodium: 0n * BigInt(SCALE),
      },

      P_AsteroidThresholdProbConfig: {
        common1: 35n,
        common2: 50n,
        eliteMicro: 55n,
        eliteSmall: 75n,
        eliteMedium: 90n,
        eliteLarge: 100n,
      },

      P_ColonyShipConfig: {
        decryption: 300n * BigInt(SCALE),
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

  Cooldown: {
    keys: [],
    tables: {
      P_CooldownConfig: {
        linNum: 11n,
        linDen: 10000n,
        linSwitch: 20000n,
        logDiv: 100000n,
        logMult: 60n,
        logAdd: 7n,
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
        holdTime: 5n * 60n * 60n,
        // spawn a shard asteroid every <shardAsteroidSpawnFrequency> players, starting at the <shardAsteroidOffset>th player
        shardAsteroidSpawnFrequency: 100n,
        shardAsteroidSpawnOffset: 25n,
        // limit shard asteroids to <maxShardAsteroids>
        maxShardAsteroids: 10n,
        shardAsteroidPoints: 50n * BigInt(SCALE),
        shardAsteroidLifeSpan: 8n * 60n * 60n,
        shardAsteroidEncryption: 1500n * BigInt(SCALE),
        shardAsteroidEncryptionRegen: BigInt(Math.round(0.0336 * SCALE)),
      },
    },
  },

  Building: {
    levels: idsToPrototypes(MUDEnums.EBuilding),
  },

  Expansion: {
    tables: { P_MaxLevel: { value: 8n } },
    levels: {
      1: { Dimensions: { width: 9, height: 7 }, P_RequiredBaseLevel: { value: 1n } },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        Dimensions: { width: 11, height: 9 },
        P_RequiredBaseLevel: { value: 2n },
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 400, Copper: 400, Lithium: 400 }),
        Dimensions: { width: 13, height: 11 },
        P_RequiredBaseLevel: { value: 3n },
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 1500, Copper: 1500, Lithium: 1500 }),
        Dimensions: { width: 17, height: 13 },
        P_RequiredBaseLevel: { value: 5n },
      },

      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 3000, Copper: 3000, Lithium: 3000, Kimberlite: 300 }),
        Dimensions: { width: 21, height: 15 },
        P_RequiredBaseLevel: { value: 8n },
      },
      6: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 7500, Copper: 7500, Lithium: 7500, Kimberlite: 1500 }),
        Dimensions: { width: 25, height: 17 },
        P_RequiredBaseLevel: { value: 13n },
      },
      7: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 25000, Copper: 25000, Lithium: 25000, Kimberlite: 3000 }),
        Dimensions: { width: 31, height: 21 },
        P_RequiredBaseLevel: { value: 14n },
      },
      8: {
        P_RequiredUpgradeResources: getResourceValues({ Iron: 60000, Copper: 60000, Lithium: 60000, Kimberlite: 5000 }),
        Dimensions: { width: maxRange.xBounds, height: maxRange.yBounds },
        P_RequiredBaseLevel: { value: 15n },
      },
    },
  },

  /* ------------------------------- Marketplace ------------------------------ */

  IronSupply: marketplaceSupplyTable(EResource.Iron, 330),
  CopperSupply: marketplaceSupplyTable(EResource.Copper, 330),
  LithiumSupply: marketplaceSupplyTable(EResource.Lithium, 330),
  TitaniumSupply: marketplaceSupplyTable(EResource.Titanium, 1),
  PlatinumSupply: marketplaceSupplyTable(EResource.Platinum, 1),
  IridiumSupply: marketplaceSupplyTable(EResource.Iridium, 1),
  IronPlateSupply: marketplaceSupplyTable(EResource.IronPlate, 137),
  AlloySupply: marketplaceSupplyTable(EResource.Alloy, 137),
  PVCellSupply: marketplaceSupplyTable(EResource.PVCell, 137),

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
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[1]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.003, U_Housing: 25 }),
      },
      2: {
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[2]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.006, U_Housing: 50 }),
      },
      3: {
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 400, Lithium: 400 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[3]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.009, U_Housing: 50 }),
      },
      4: {
        P_RequiredResources: getResourceValues({ Iron: 800, Copper: 800, Lithium: 800 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[4]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.012, U_Housing: 100 }),
      },
      5: {
        P_RequiredResources: getResourceValues({ Iron: 1500, Copper: 1500, Lithium: 1500, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[5]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.015, U_Housing: 100 }),
      },
      6: {
        P_RequiredResources: getResourceValues({ IronPlate: 800, Alloy: 800, PVCell: 800, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[6]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.019, U_Housing: 175 }),
      },
      7: {
        P_RequiredResources: getResourceValues({
          IronPlate: 1500,
          Alloy: 1500,
          PVCell: 1500,
          U_Electricity: 50,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[7]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.023, U_Housing: 175 }),
      },
      8: {
        P_RequiredResources: getResourceValues({
          IronPlate: 2500,
          Alloy: 2500,
          PVCell: 2500,
          U_Electricity: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[8]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.027, U_Housing: 250 }),
      },
      9: {
        P_RequiredResources: getResourceValues({
          IronPlate: 4000,
          Alloy: 4000,
          PVCell: 4000,
          U_Electricity: 250,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[9]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.031, U_Housing: 250 }),
      },
      10: {
        P_RequiredResources: getResourceValues({
          Titanium: 500,
          Iridium: 500,
          Platinum: 500,
          Kimberlite: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[10]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.035, U_Housing: 325 }),
      },
      11: {
        P_RequiredResources: getResourceValues({
          Titanium: 1200,
          Iridium: 1200,
          Platinum: 1200,
          Kimberlite: 200,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[11]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.039, U_Housing: 325 }),
      },
      12: {
        P_RequiredResources: getResourceValues({
          Titanium: 2400,
          Iridium: 2400,
          Platinum: 2400,
          Kimberlite: 400,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[12]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.043, U_Housing: 400 }),
      },
      13: {
        P_RequiredResources: getResourceValues({
          Titanium: 4000,
          Iridium: 4000,
          Platinum: 4000,
          Kimberlite: 800,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[13]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.047, U_Housing: 400 }),
      },
      14: {
        P_RequiredResources: getResourceValues({
          Titanium: 6000,
          Iridium: 6000,
          Platinum: 6000,
          Kimberlite: 1200,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[14]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.051, U_Housing: 500 }),
      },
      15: {
        P_RequiredResources: getResourceValues({
          Titanium: 10000,
          Iridium: 10000,
          Platinum: 10000,
          Kimberlite: 2000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(mainBaseStorageUpgrades[15]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.06, U_Housing: 600 }),
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
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[1]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.006, U_Housing: 50 }),
      },
      2: {
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[2]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.012, U_Housing: 100 }),
      },
      3: {
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 400, Lithium: 400 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[3]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.018, U_Housing: 100 }),
      },
      4: {
        P_RequiredResources: getResourceValues({ Iron: 800, Copper: 800, Lithium: 800 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[4]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.024, U_Housing: 200 }),
      },
      5: {
        P_RequiredResources: getResourceValues({ Iron: 1500, Copper: 1500, Lithium: 1500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[5]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.03, U_Housing: 200 }),
      },
      6: {
        P_RequiredResources: getResourceValues({ IronPlate: 1200, Alloy: 1200, PVCell: 1200 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[6]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.038, U_Housing: 350 }),
      },
      7: {
        P_RequiredResources: getResourceValues({
          IronPlate: 2000,
          Alloy: 2000,
          PVCell: 2000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[7]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.046, U_Housing: 350 }),
      },
      8: {
        P_RequiredResources: getResourceValues({
          IronPlate: 3000,
          Alloy: 3000,
          PVCell: 3000,
          Kimberlite: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[8]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.054, U_Housing: 500 }),
      },
      9: {
        P_RequiredResources: getResourceValues({
          IronPlate: 4000,
          Alloy: 4000,
          PVCell: 4000,
          Kimberlite: 200,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[9]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.062, U_Housing: 500 }),
      },
      10: {
        P_RequiredResources: getResourceValues({
          Titanium: 800,
          Iridium: 800,
          Platinum: 800,
          Kimberlite: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[10]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.07, U_Housing: 650 }),
      },
      11: {
        P_RequiredResources: getResourceValues({
          Titanium: 1500,
          Iridium: 1500,
          Platinum: 1500,
          Kimberlite: 100,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[11]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.078, U_Housing: 650 }),
      },
      12: {
        P_RequiredResources: getResourceValues({
          Titanium: 2500,
          Iridium: 2500,
          Platinum: 2500,
          Kimberlite: 250,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[12]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.086, U_Housing: 800 }),
      },
      13: {
        P_RequiredResources: getResourceValues({
          Titanium: 4000,
          Iridium: 4000,
          Platinum: 4000,
          Kimberlite: 800,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[13]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.094, U_Housing: 800 }),
      },
      14: {
        P_RequiredResources: getResourceValues({
          Titanium: 6000,
          Iridium: 6000,
          Platinum: 6000,
          Kimberlite: 1200,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[14]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.102, U_Housing: 1000 }),
      },
      15: {
        P_RequiredResources: getResourceValues({
          Titanium: 10000,
          Iridium: 10000,
          Platinum: 10000,
          Kimberlite: 2000,
        }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(wormholeBaseStorageUpgrades[15]),
        },
        P_Production: getResourceValues({ R_Encryption: 0.0168, R_HP: 0.12, U_Housing: 1200 }),
      },
    },
  },
  ...upgradesByLevel("WormholeBase", wormholeBaseStorageUpgrades),

  // Mines
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 15n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Iron: 0.09 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 150 }),
        P_Production: getResourceValues({ Iron: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 400 }),
        P_Production: getResourceValues({ Iron: 0.15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 1200 }),
        P_Production: getResourceValues({ Iron: 0.18 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 2000 }),
        P_Production: getResourceValues({ Iron: 0.23 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2500, IronPlate: 500 }),
        P_Production: getResourceValues({ Iron: 0.28 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 5000, IronPlate: 1000 }),
        P_Production: getResourceValues({ Iron: 0.33 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000, IronPlate: 1500 }),
        P_Production: getResourceValues({ Iron: 0.38 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Iron: 20000, IronPlate: 2000 }),
        P_Production: getResourceValues({ Iron: 0.43 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Iron: 35000, Titanium: 800 }),
        P_Production: getResourceValues({ Iron: 0.5 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Iron: 50000, Titanium: 1500 }),
        P_Production: getResourceValues({ Iron: 0.57 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Iron: 75000, Titanium: 2000 }),
        P_Production: getResourceValues({ Iron: 0.65 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Titanium: 5000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Iron: 0.75 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Titanium: 8000, Kimberlite: 1500 }),
        P_Production: getResourceValues({ Iron: 0.87 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Titanium: 10000, Kimberlite: 2000 }),
        P_Production: getResourceValues({ Iron: 1.0 }),
      },
    },
  },
  CopperMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 15n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Copper: 0.09 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 100 }),
        P_Production: getResourceValues({ Copper: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 300 }),
        P_Production: getResourceValues({ Copper: 0.15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 1000 }),
        P_Production: getResourceValues({ Copper: 0.18 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 1600 }),
        P_Production: getResourceValues({ Copper: 0.23 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2500, Alloy: 500 }),
        P_Production: getResourceValues({ Copper: 0.28 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 5000, Alloy: 1000 }),
        P_Production: getResourceValues({ Copper: 0.33 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000, Alloy: 1500 }),
        P_Production: getResourceValues({ Copper: 0.38 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Iron: 20000, Alloy: 2000 }),
        P_Production: getResourceValues({ Copper: 0.43 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Iron: 35000, Iridium: 800 }),
        P_Production: getResourceValues({ Copper: 0.5 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Iron: 50000, Iridium: 1500 }),
        P_Production: getResourceValues({ Copper: 0.57 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Iron: 75000, Iridium: 3000 }),
        P_Production: getResourceValues({ Copper: 0.65 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Iridium: 5000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Copper: 0.75 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Iridium: 8000, Kimberlite: 1500 }),
        P_Production: getResourceValues({ Copper: 0.87 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Iridium: 10000, Kimberlite: 2000 }),
        P_Production: getResourceValues({ Copper: 1.0 }),
      },
    },
  },
  LithiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 15n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iron") },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1n }, P_Production: getResourceValues({ Lithium: 0.09 }) },
      2: {
        P_RequiredBaseLevel: { value: 1n },
        P_RequiredResources: getResourceValues({ Iron: 50, Lithium: 100 }),
        P_Production: getResourceValues({ Lithium: 0.12 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 100, Lithium: 300 }),
        P_Production: getResourceValues({ Lithium: 0.15 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 200, Lithium: 1000 }),
        P_Production: getResourceValues({ Lithium: 0.18 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 400, Lithium: 1600 }),
        P_Production: getResourceValues({ Lithium: 0.23 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 2500, PVCell: 500 }),
        P_Production: getResourceValues({ Lithium: 0.28 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 5000, PVCell: 1000 }),
        P_Production: getResourceValues({ Lithium: 0.33 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 10000, PVCell: 1500 }),
        P_Production: getResourceValues({ Lithium: 0.38 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Iron: 20000, PVCell: 2000 }),
        P_Production: getResourceValues({ Lithium: 0.43 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Iron: 35000, Platinum: 800 }),
        P_Production: getResourceValues({ Lithium: 0.5 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Iron: 50000, Platinum: 1500 }),
        P_Production: getResourceValues({ Lithium: 0.57 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Iron: 75000, Platinum: 3000 }),
        P_Production: getResourceValues({ Lithium: 0.65 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Platinum: 5000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Lithium: 0.75 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Platinum: 8000, Kimberlite: 1500 }),
        P_Production: getResourceValues({ Lithium: 0.87 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 100000, Platinum: 10000, Kimberlite: 2000 }),
        P_Production: getResourceValues({ Lithium: 1.0 }),
      },
    },
  },
  KimberliteMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Kimberlite") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 1500, Copper: 1500, Lithium: 1500 }),
        P_RequiredBaseLevel: { value: 1n },
        P_Production: getResourceValues({ Kimberlite: 0.008 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, Alloy: 1500, PVCell: 1500 }),
        P_Production: getResourceValues({ Kimberlite: 0.017 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500 }),
        P_Production: getResourceValues({ Kimberlite: 0.025 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Titanium: 800, Iridium: 800, Platinum: 800 }),
        P_Production: getResourceValues({ Kimberlite: 0.038 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 1200, Iridium: 1200, Platinum: 1200, Kimberlite: 1200 }),
        P_Production: getResourceValues({ Kimberlite: 0.05 }),
      },
    },
  },
  IridiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Iridium") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Copper: 4500 }),
        P_RequiredBaseLevel: { value: 1n },
        P_Production: getResourceValues({ Iridium: 0.017 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 2500, Alloy: 3000 }),
        P_Production: getResourceValues({ Iridium: 0.033 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 5000, Iridium: 1000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Iridium: 0.05 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Copper: 10000, Iridium: 2000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Iridium: 0.075 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Copper: 20000, Iridium: 3000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Iridium: 0.1 }),
      },
    },
  },
  PlatinumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Platinum") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Lithium: 4500 }),
        P_RequiredBaseLevel: { value: 1n },
        P_Production: getResourceValues({ Platinum: 0.017 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Lithium: 2500, PVCell: 3000 }),
        P_Production: getResourceValues({ Platinum: 0.033 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 5000, Platinum: 1000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Platinum: 0.05 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Lithium: 10000, Platinum: 2000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Platinum: 0.075 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 20000, Platinum: 3000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Platinum: 0.1 }),
      },
    },
  },
  TitaniumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5n },
      P_RequiredTile: { value: MUDEnums.EResource.indexOf("Titanium") },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 4500 }),
        P_RequiredBaseLevel: { value: 1n },
        P_Production: getResourceValues({ Titanium: 0.017 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 2500, IronPlate: 3000 }),
        P_Production: getResourceValues({ Titanium: 0.033 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 5000, Titanium: 1000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Titanium: 0.05 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Iron: 10000, Titanium: 2000, U_Electricity: 50 }),
        P_Production: getResourceValues({ Titanium: 0.075 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 20000, Titanium: 3000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ Titanium: 0.1 }),
      },
    },
  },
  // Factories
  IronPlateFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200, Lithium: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.06 }),
        P_Production: getResourceValues({ IronPlate: 0.024 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 400, Lithium: 100 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.09 }),
        P_Production: getResourceValues({ IronPlate: 0.036 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 800, Lithium: 200 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.12 }),
        P_Production: getResourceValues({ IronPlate: 0.048 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 1200, Lithium: 400 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.15 }),
        P_Production: getResourceValues({ IronPlate: 0.06 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 2000, Lithium: 800 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.2 }),
        P_Production: getResourceValues({ IronPlate: 0.085 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 5000, IronPlate: 1000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.25 }),
        P_Production: getResourceValues({ IronPlate: 0.11 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 10000, IronPlate: 2000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.3 }),
        P_Production: getResourceValues({ IronPlate: 0.135 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 20000, IronPlate: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.35 }),
        P_Production: getResourceValues({ IronPlate: 0.165 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Lithium: 35000, IronPlate: 4000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.4 }),
        P_Production: getResourceValues({ IronPlate: 0.2 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Lithium: 50000, Titanium: 800, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.47 }),
        P_Production: getResourceValues({ IronPlate: 0.24 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Lithium: 70000, Titanium: 1500, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.54 }),
        P_Production: getResourceValues({ IronPlate: 0.3 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Titanium: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.62 }),
        P_Production: getResourceValues({ IronPlate: 0.38 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Titanium: 5000, Kimberlite: 1000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.72 }),
        P_Production: getResourceValues({ IronPlate: 0.48 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Titanium: 8000, Kimberlite: 1500 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.84 }),
        P_Production: getResourceValues({ IronPlate: 0.58 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Titanium: 10000, Kimberlite: 2000 }),
        P_RequiredDependency: getResourceValue({ Iron: 0.97 }),
        P_Production: getResourceValues({ IronPlate: 0.7 }),
      },
    },
  },
  AlloyFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 200, Lithium: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.06 }),
        P_Production: getResourceValues({ Alloy: 0.024 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 400, Lithium: 100 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.09 }),
        P_Production: getResourceValues({ Alloy: 0.036 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 800, Lithium: 200 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.12 }),
        P_Production: getResourceValues({ Alloy: 0.048 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 1200, Lithium: 400 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.15 }),
        P_Production: getResourceValues({ Alloy: 0.06 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 2000, Lithium: 800 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.2 }),
        P_Production: getResourceValues({ Alloy: 0.085 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 5000, Alloy: 1000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.25 }),
        P_Production: getResourceValues({ Alloy: 0.11 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 10000, Alloy: 2000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.3 }),
        P_Production: getResourceValues({ Alloy: 0.135 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 20000, Alloy: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.35 }),
        P_Production: getResourceValues({ Alloy: 0.165 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Lithium: 35000, Alloy: 4000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.4 }),
        P_Production: getResourceValues({ Alloy: 0.2 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Lithium: 50000, Iridium: 800, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.47 }),
        P_Production: getResourceValues({ Alloy: 0.24 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Lithium: 70000, Iridium: 1500, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.54 }),
        P_Production: getResourceValues({ Alloy: 0.3 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Iridium: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.62 }),
        P_Production: getResourceValues({ Alloy: 0.38 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Iridium: 5000, Kimberlite: 1000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.72 }),
        P_Production: getResourceValues({ Alloy: 0.48 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Iridium: 8000, Kimberlite: 1500 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.84 }),
        P_Production: getResourceValues({ Alloy: 0.58 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Iridium: 10000, Kimberlite: 2000 }),
        P_RequiredDependency: getResourceValue({ Copper: 0.97 }),
        P_Production: getResourceValues({ Alloy: 0.7 }),
      },
    },
  },
  PVCellFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Lithium: 250 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.06 }),
        P_Production: getResourceValues({ PVCell: 0.024 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Lithium: 500 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.09 }),
        P_Production: getResourceValues({ PVCell: 0.036 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Lithium: 1000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.12 }),
        P_Production: getResourceValues({ PVCell: 0.048 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Lithium: 1600 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.15 }),
        P_Production: getResourceValues({ PVCell: 0.06 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 2800 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.2 }),
        P_Production: getResourceValues({ PVCell: 0.085 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 5000, PVCell: 1000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.25 }),
        P_Production: getResourceValues({ PVCell: 0.11 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 10000, PVCell: 2000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.3 }),
        P_Production: getResourceValues({ PVCell: 0.135 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 20000, PVCell: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.35 }),
        P_Production: getResourceValues({ PVCell: 0.165 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Lithium: 35000, PVCell: 4000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.4 }),
        P_Production: getResourceValues({ PVCell: 0.2 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Lithium: 50000, Platinum: 800, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.47 }),
        P_Production: getResourceValues({ PVCell: 0.24 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Lithium: 70000, Platinum: 1500, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.54 }),
        P_Production: getResourceValues({ PVCell: 0.3 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Platinum: 3000, U_Electricity: 50 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.62 }),
        P_Production: getResourceValues({ PVCell: 0.38 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Platinum: 5000, Kimberlite: 1000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.72 }),
        P_Production: getResourceValues({ PVCell: 0.48 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Platinum: 8000, Kimberlite: 1500 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.84 }),
        P_Production: getResourceValues({ PVCell: 0.58 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 100000, Platinum: 10000, Kimberlite: 2000 }),
        P_RequiredDependency: getResourceValue({ Lithium: 0.97 }),
        P_Production: getResourceValues({ PVCell: 0.7 }),
      },
    },
  },

  // Utilities
  StorageUnit: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 10n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250, U_Electricity: 25 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, Alloy: 200, PVCell: 200, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[4]),
        },
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ IronPlate: 500, Alloy: 500, PVCell: 500, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[5]),
        },
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000, U_Electricity: 50 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[6]),
        },
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, Alloy: 2000, PVCell: 2000, U_Electricity: 100 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[7]),
        },
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 4000, Alloy: 4000, PVCell: 4000, Kimberlite: 100 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[8]),
        },
      },
      9: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ IronPlate: 8000, Alloy: 8000, PVCell: 8000, Kimberlite: 500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[9]),
        },
      },
      10: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ IronPlate: 15000, Alloy: 15000, PVCell: 15000, Kimberlite: 1000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(storageUnitStorageUpgrades[10]),
        },
      },
    },
  },
  ...upgradesByLevel("StorageUnit", storageUnitStorageUpgrades),
  SolarPanel: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_Production: getResourceValues({ U_Electricity: 50 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
        P_Production: getResourceValues({ U_Electricity: 100 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 200, Lithium: 200 }),
        P_Production: getResourceValues({ U_Electricity: 150 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 400, Lithium: 400 }),
        P_Production: getResourceValues({ U_Electricity: 200 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 1000, Copper: 1000, Lithium: 1000 }),
        P_Production: getResourceValues({ U_Electricity: 275 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 500, Alloy: 500, PVCell: 500 }),
        P_Production: getResourceValues({ U_Electricity: 350 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000 }),
        P_Production: getResourceValues({ U_Electricity: 425 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, Alloy: 1500, PVCell: 1500, Kimberlite: 100 }),
        P_Production: getResourceValues({ U_Electricity: 500 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 2500, Alloy: 2500, PVCell: 2500, Kimberlite: 200 }),
        P_Production: getResourceValues({ U_Electricity: 575 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500 }),
        P_Production: getResourceValues({ U_Electricity: 650 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Titanium: 1000, Iridium: 1000, Platinum: 1000 }),
        P_Production: getResourceValues({ U_Electricity: 750 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Titanium: 2000, Iridium: 2000, Platinum: 2000 }),
        P_Production: getResourceValues({ U_Electricity: 850 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Titanium: 3000, Iridium: 3000, Platinum: 3000, Kimberlite: 100 }),
        P_Production: getResourceValues({ U_Electricity: 950 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Titanium: 4000, Iridium: 4000, Platinum: 4000, Kimberlite: 500 }),
        P_Production: getResourceValues({ U_Electricity: 1050 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 5000, Iridium: 5000, Platinum: 5000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ U_Electricity: 1200 }),
      },
    },
  },

  // Units
  Garage: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
        P_Production: getResourceValues({ U_Housing: 10 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_Production: getResourceValues({ U_Housing: 20 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
        P_Production: getResourceValues({ U_Housing: 30 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 150, Copper: 150, Lithium: 150 }),
        P_Production: getResourceValues({ U_Housing: 40 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 200, Lithium: 200 }),
        P_Production: getResourceValues({ U_Housing: 50 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100, U_Electricity: 25 }),
        P_Production: getResourceValues({ U_Housing: 60 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, Alloy: 200, PVCell: 200, U_Electricity: 25 }),
        P_Production: getResourceValues({ U_Housing: 70 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 300, Alloy: 300, PVCell: 300, U_Electricity: 25 }),
        P_Production: getResourceValues({ U_Housing: 80 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 400, Alloy: 400, PVCell: 400, U_Electricity: 25 }),
        P_Production: getResourceValues({ U_Housing: 90 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Titanium: 50, Iridium: 50, Platinum: 50 }),
        P_Production: getResourceValues({ U_Housing: 100 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Titanium: 100, Iridium: 100, Platinum: 100 }),
        P_Production: getResourceValues({ U_Housing: 110 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Titanium: 150, Iridium: 150, Platinum: 150 }),
        P_Production: getResourceValues({ U_Housing: 120 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Titanium: 200, Iridium: 200, Platinum: 200 }),
        P_Production: getResourceValues({ U_Housing: 130 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Titanium: 250, Iridium: 250, Platinum: 250 }),
        P_Production: getResourceValues({ U_Housing: 140 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 300, Iridium: 300, Platinum: 300 }),
        P_Production: getResourceValues({ U_Housing: 150 }),
      },
    },
  },
  Hangar: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 200, Lithium: 200 }),
        P_Production: getResourceValues({ U_Housing: 60 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 500, Copper: 500, Lithium: 500 }),
        P_Production: getResourceValues({ U_Housing: 120 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 1000, Copper: 1000, Lithium: 1000 }),
        P_Production: getResourceValues({ U_Housing: 180 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 1800, Copper: 1800, Lithium: 1800 }),
        P_Production: getResourceValues({ U_Housing: 240 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 2400, Copper: 2400, Lithium: 2400 }),
        P_Production: getResourceValues({ U_Housing: 300 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1500, Alloy: 1500, PVCell: 1500, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 360 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 1800, Alloy: 1800, PVCell: 1800, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 420 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 2400, Alloy: 2400, PVCell: 2400, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 480 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 3000, Alloy: 3000, PVCell: 3000, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 540 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Titanium: 300, Iridium: 300, Platinum: 300, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 600 }),
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Titanium: 600, Iridium: 600, Platinum: 600, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 660 }),
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Titanium: 900, Iridium: 900, Platinum: 900, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 720 }),
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Titanium: 1200, Iridium: 1200, Platinum: 1200, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 780 }),
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Titanium: 1500, Iridium: 1500, Platinum: 1500, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 840 }),
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 2000, Iridium: 2000, Platinum: 2000, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Housing: 900 }),
      },
    },
  },
  DroneFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 50, Lithium: 100 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 100, Lithium: 200 }),
        P_UnitProdMultiplier: { value: 105n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 200, Lithium: 400, U_Electricity: 25 }),
        P_UnitProdMultiplier: { value: 110n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 600, Copper: 400, Lithium: 600, U_Electricity: 25 }),
        P_UnitProdMultiplier: { value: 115n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 1000, Copper: 800, Lithium: 1000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 4000, Alloy: 1000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 130n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone"]) },
      },
      7: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 10000, Alloy: 2000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 140n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 20000, Alloy: 3000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Copper: 35000, Alloy: 4000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 160n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Copper: 50000, Iridium: 800, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 170n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Copper: 70000, Iridium: 1500, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 180n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Copper: 100000, Iridium: 3000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 190n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },

      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({
          Copper: 100000,
          Iridium: 5000,
          Kimberlite: 1000,
          U_Electricity: 150,
        }),
        P_UnitProdMultiplier: { value: 210n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({
          Copper: 100000,
          Iridium: 8000,
          Kimberlite: 1500,
          U_Electricity: 200,
        }),
        P_UnitProdMultiplier: { value: 230n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({
          Copper: 100000,
          Iridium: 10000,
          Kimberlite: 2000,
          U_Electricity: 250,
        }),
        P_UnitProdMultiplier: { value: 250n },
        P_UnitProdTypes: { value: encodeArray(["AnvilDrone", "HammerDrone", "AegisDrone", "StingerDrone"]) },
      },
    },
  },
  Workshop: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 15n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 50, Lithium: 100 }),
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 2n },
        P_RequiredResources: getResourceValues({ Iron: 200, Copper: 100, Lithium: 200 }),
        P_UnitProdMultiplier: { value: 105n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Iron: 400, Copper: 200, Lithium: 400 }),
        P_UnitProdMultiplier: { value: 110n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 4n },
        P_RequiredResources: getResourceValues({ Iron: 600, Copper: 400, Lithium: 600 }),
        P_UnitProdMultiplier: { value: 115n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Iron: 1000, Copper: 800, Lithium: 1000, U_Electricity: 25 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Copper: 2500, Alloy: 500, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 125n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      7: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Copper: 5000, Alloy: 1000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 130n },
        P_UnitProdTypes: { value: encodeArray(["MinutemanMarine"]) },
      },
      8: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 10000, Alloy: 1500, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 135n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      9: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Copper: 17500, Alloy: 2000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 140n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine"]) },
      },
      10: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Copper: 25000, Iridium: 400, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 150n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      11: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Copper: 35000, Iridium: 750, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 160n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      12: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Copper: 50000, Iridium: 1500, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 170n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      13: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Copper: 50000, Iridium: 2500, Kimberlite: 500 }),
        P_UnitProdMultiplier: { value: 180n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      14: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Copper: 50000, Iridium: 4000, Kimberlite: 750 }),
        P_UnitProdMultiplier: { value: 190n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
      15: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Copper: 50000, Iridium: 5000, Kimberlite: 1000 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["TridentMarine", "MinutemanMarine", "LightningCraft"]) },
      },
    },
  },

  Shipyard: {
    tables: {
      P_Blueprint: { value: getBlueprint(6, 4) },
      P_MaxLevel: { value: 10n },
    },
    levels: {
      1: {
        P_RequiredResources: getResourceValues({ Iron: 1000, Copper: 1000, Lithium: 1000, U_Electricity: 50 }),
        P_RequiredBaseLevel: { value: 8n },
        P_UnitProdMultiplier: { value: 100n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      2: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 120n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      3: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 2000, Alloy: 2000, PVCell: 2000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 140n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      4: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 3000, Alloy: 3000, PVCell: 3000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 160n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      5: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ IronPlate: 4000, Alloy: 4000, PVCell: 4000, U_Electricity: 50 }),
        P_UnitProdMultiplier: { value: 180n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      6: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, Alloy: 5000, PVCell: 5000, U_Electricity: 100 }),
        P_UnitProdMultiplier: { value: 200n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      7: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, Alloy: 5000, PVCell: 5000, Titanium: 1000 }),
        P_UnitProdMultiplier: { value: 220n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      8: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, Alloy: 5000, PVCell: 5000, Iridium: 1000 }),
        P_UnitProdMultiplier: { value: 240n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      9: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, Alloy: 5000, PVCell: 5000, Platinum: 1000 }),
        P_UnitProdMultiplier: { value: 260n },
        P_UnitProdTypes: { value: encodeArray(["ColonyShip"]) },
      },
      10: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 1000, Iridium: 1000, Platinum: 1000, Kimberlite: 1000 }),
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
        P_RequiredResources: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
        P_Production: getResourceValues({ U_MaxFleets: 1 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 500, Alloy: 500, PVCell: 500, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_MaxFleets: 2 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500, U_Electricity: 250 }),
        P_Production: getResourceValues({ U_MaxFleets: 3 }),
      },
    },
  },

  // Defensive Buildings
  SAM: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 10n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 100, PVCell: 100, Alloy: 100, U_Electricity: 100 }),
        P_Production: getResourceValues({ U_Defense: 400 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[1]),
        },
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, PVCell: 200, Alloy: 200, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 800 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[2]),
        },
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ IronPlate: 300, PVCell: 300, Alloy: 300, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 1200 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      4: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 500, PVCell: 500, Alloy: 500, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 1600 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      5: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Titanium: 100, Iridium: 100, Platinum: 100, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 2000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      6: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Titanium: 200, Iridium: 200, Platinum: 200, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 2500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      7: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ Titanium: 300, Iridium: 300, Platinum: 300, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 3000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      8: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500, U_Electricity: 100 }),

        P_Production: getResourceValues({ U_Defense: 3500 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      9: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500, Kimberlite: 500 }),

        P_Production: getResourceValues({ U_Defense: 4000 }),
        P_ListMaxResourceUpgrades: {
          value: upgradesToList(samSiteStorageUpgrades[3]),
        },
      },
      10: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Titanium: 1000, Iridium: 1000, Platinum: 1000, Kimberlite: 1000 }),

        P_Production: getResourceValues({ U_Defense: 5000 }),
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
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000, U_Electricity: 200 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 5, R_HP: 0.008 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Titanium: 500, Iridium: 500, Platinum: 500, U_Electricity: 1100 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 15, R_HP: 0.016 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Kimberlite: 4000, U_Electricity: 1100 }),
        P_Production: getResourceValues({ M_DefenseMultiplier: 30, R_HP: 0.024 }),
      },
    },
  },

  Vault: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 10n },
    },
    levels: {
      1: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
        P_Production: getResourceValues({ U_Unraidable: 250 }),
      },
      2: {
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
        P_Production: getResourceValues({ U_Unraidable: 500 }),
      },
      3: {
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250, U_Electricity: 25 }),
        P_Production: getResourceValues({ U_Unraidable: 750 }),
      },
      4: {
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ IronPlate: 200, Alloy: 200, PVCell: 200, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Unraidable: 2000, U_AdvancedUnraidable: 500 }),
      },
      5: {
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ IronPlate: 500, Alloy: 500, PVCell: 500, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Unraidable: 3000, U_AdvancedUnraidable: 1000 }),
      },
      6: {
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ IronPlate: 1000, Alloy: 1000, PVCell: 1000, U_Electricity: 50 }),
        P_Production: getResourceValues({ U_Unraidable: 4000, U_AdvancedUnraidable: 1500 }),
      },
      7: {
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({ IronPlate: 2500, Alloy: 2500, PVCell: 2500, U_Electricity: 100 }),
        P_Production: getResourceValues({ U_Unraidable: 5000, U_AdvancedUnraidable: 2000 }),
      },
      8: {
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ IronPlate: 5000, Alloy: 5000, PVCell: 5000, Kimberlite: 100 }),
        P_Production: getResourceValues({ U_Unraidable: 10000, U_AdvancedUnraidable: 2500 }),
      },
      9: {
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({ IronPlate: 8000, Alloy: 8000, PVCell: 8000, Kimberlite: 500 }),
        P_Production: getResourceValues({ U_Unraidable: 15000, U_AdvancedUnraidable: 3000 }),
      },
      10: {
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ IronPlate: 15000, Alloy: 15000, PVCell: 15000, Kimberlite: 1000 }),
        P_Production: getResourceValues({ U_Unraidable: 25000, U_AdvancedUnraidable: 5000 }),
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
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100, U_Electricity: 100 }),
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
        multiplier: 3n,
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
      P_MaxLevel: { value: 5n },
    },
    levels: {
      0: {
        P_RequiredResources: getResourceValues({
          Titanium: 10,
          Platinum: 10,
          Iridium: 10,
          Kimberlite: 10,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 10,
          attack: 10,
          defense: 10,
          cargo: 100,
          speed: 600,
          trainingTime: 1800,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 200 }),
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({
          Titanium: 11,
          Platinum: 11,
          Iridium: 11,
          Kimberlite: 11,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 11,
          attack: 11,
          defense: 11,
          cargo: 120,
          speed: 720,
          trainingTime: 1800,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 600 }),
        P_RequiredBaseLevel: { value: 12n },
        P_RequiredResources: getResourceValues({
          Titanium: 12,
          Platinum: 12,
          Iridium: 12,
          Kimberlite: 12,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 12,
          attack: 12,
          defense: 12,
          cargo: 140,
          speed: 840,
          trainingTime: 1800,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 2000 }),
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({
          Titanium: 13,
          Platinum: 13,
          Iridium: 13,
          Kimberlite: 13,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 13,
          attack: 13,
          defense: 13,
          cargo: 160,
          speed: 960,
          trainingTime: 1800,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 4000 }),
        P_RequiredBaseLevel: { value: 14n },
        P_RequiredResources: getResourceValues({
          Titanium: 14,
          Platinum: 14,
          Iridium: 14,
          Kimberlite: 14,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 14,
          attack: 14,
          defense: 14,
          cargo: 180,
          speed: 1080,
          trainingTime: 1800,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Kimberlite: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({
          Titanium: 15,
          Platinum: 15,
          Iridium: 15,
          Kimberlite: 15,
          U_Housing: 1,
        }),
        P_Unit: getPUnitData({
          hp: 15,
          attack: 15,
          defense: 15,
          cargo: 200,
          speed: 1200,
          trainingTime: 1800,
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
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 250,
          attack: 200,
          defense: 200,
          cargo: 60,
          speed: 50,
          trainingTime: 600,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 200 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 280,
          attack: 210,
          defense: 225,
          cargo: 64,
          speed: 60,
          trainingTime: 580,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 600 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 310,
          attack: 220,
          defense: 250,
          cargo: 68,
          speed: 70,
          trainingTime: 560,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 2000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 340,
          attack: 230,
          defense: 275,
          cargo: 72,
          speed: 80,
          trainingTime: 540,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 4000 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 370,
          attack: 240,
          defense: 300,
          cargo: 76,
          speed: 90,
          trainingTime: 520,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 25, IronPlate: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 400,
          attack: 250,
          defense: 350,
          cargo: 80,
          speed: 100,
          trainingTime: 500,
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
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 600,
          attack: 100,
          defense: 500,
          cargo: 30,
          speed: 50,
          trainingTime: 1800,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 200 }),
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 720,
          attack: 112,
          defense: 575,
          cargo: 32,
          speed: 60,
          trainingTime: 1800,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 600 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 840,
          attack: 124,
          defense: 650,
          cargo: 34,
          speed: 70,
          trainingTime: 1800,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 2000 }),
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 960,
          attack: 136,
          defense: 725,
          cargo: 36,
          speed: 80,
          trainingTime: 1800,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 4000 }),
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 1080,
          attack: 148,
          defense: 800,
          cargo: 38,
          speed: 90,
          trainingTime: 1800,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Titanium: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Iron: 100, IronPlate: 100, Titanium: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 1200,
          attack: 160,
          defense: 1000,
          cargo: 40,
          speed: 100,
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
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 175,
          attack: 300,
          defense: 200,
          cargo: 50,
          speed: 50,
          trainingTime: 600,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 200 }),
        P_RequiredBaseLevel: { value: 6n },
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 190,
          attack: 325,
          defense: 210,
          cargo: 60,
          speed: 70,
          trainingTime: 580,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 600 }),
        P_RequiredBaseLevel: { value: 7n },
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 205,
          attack: 350,
          defense: 220,
          cargo: 70,
          speed: 90,
          trainingTime: 560,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 2000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 220,
          attack: 375,
          defense: 230,
          cargo: 80,
          speed: 110,
          trainingTime: 540,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 4000 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 235,
          attack: 400,
          defense: 240,
          cargo: 90,
          speed: 130,
          trainingTime: 520,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 25, PVCell: 50, U_Housing: 2 }),
        P_Unit: getPUnitData({
          hp: 250,
          attack: 450,
          defense: 250,
          cargo: 100,
          speed: 150,
          trainingTime: 500,
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
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 500,
          attack: 600,
          defense: 75,
          cargo: 25,
          speed: 100,
          trainingTime: 1800,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 200 }),
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 600,
          attack: 720,
          defense: 100,
          cargo: 30,
          speed: 120,
          trainingTime: 1800,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 600 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 700,
          attack: 840,
          defense: 125,
          cargo: 35,
          speed: 140,
          trainingTime: 1800,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 2000 }),
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 800,
          attack: 960,
          defense: 150,
          cargo: 40,
          speed: 160,
          trainingTime: 1800,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 4000 }),
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 900,
          attack: 1080,
          defense: 175,
          cargo: 45,
          speed: 180,
          trainingTime: 1800,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Platinum: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Lithium: 100, PVCell: 100, Platinum: 20, U_Housing: 3 }),
        P_Unit: getPUnitData({
          hp: 1000,
          attack: 1200,
          defense: 200,
          cargo: 50,
          speed: 200,
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
        P_RequiredResources: getResourceValues({ IronPlate: 2500, Alloy: 2500, PVCell: 2500 }),
        P_RequiredBaseLevel: { value: 8n },
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
          hp: 200,
          attack: 0,
          defense: 200,
          cargo: 0,
          speed: 1,
          trainingTime: 720,
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
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 15,
          attack: 40,
          defense: 20,
          cargo: 40,
          speed: 250,
          trainingTime: 120,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 200 }),
        P_RequiredBaseLevel: { value: 3n },
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 17,
          attack: 43,
          defense: 22,
          cargo: 44,
          speed: 275,
          trainingTime: 110,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 600 }),
        P_RequiredBaseLevel: { value: 5n },
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 19,
          attack: 46,
          defense: 24,
          cargo: 48,
          speed: 300,
          trainingTime: 100,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 2000 }),
        P_RequiredBaseLevel: { value: 8n },
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 21,
          attack: 49,
          defense: 26,
          cargo: 52,
          speed: 325,
          trainingTime: 90,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 4000 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 23,
          attack: 52,
          defense: 28,
          cargo: 56,
          speed: 350,
          trainingTime: 80,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Copper: 25, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 25,
          attack: 55,
          defense: 30,
          cargo: 60,
          speed: 400,
          trainingTime: 60,
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
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 60,
          attack: 70,
          defense: 80,
          cargo: 50,
          speed: 150,
          trainingTime: 200,
        }),
      },
      1: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 200 }),
        P_RequiredBaseLevel: { value: 9n },
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 64,
          attack: 74,
          defense: 84,
          cargo: 60,
          speed: 160,
          trainingTime: 190,
        }),
      },
      2: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 600 }),
        P_RequiredBaseLevel: { value: 10n },
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 68,
          attack: 78,
          defense: 88,
          cargo: 70,
          speed: 170,
          trainingTime: 180,
        }),
      },
      3: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 2000 }),
        P_RequiredBaseLevel: { value: 11n },
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 72,
          attack: 82,
          defense: 92,
          cargo: 80,
          speed: 180,
          trainingTime: 170,
        }),
      },
      4: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 4000 }),
        P_RequiredBaseLevel: { value: 13n },
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 76,
          attack: 86,
          defense: 96,
          cargo: 90,
          speed: 190,
          trainingTime: 160,
        }),
      },
      5: {
        P_RequiredUpgradeResources: getResourceValues({ Iridium: 10000 }),
        P_RequiredBaseLevel: { value: 15n },
        P_RequiredResources: getResourceValues({ Copper: 10, Alloy: 10, U_Housing: 1 }),
        P_Unit: getPUnitData({
          hp: 80,
          attack: 90,
          defense: 100,
          cargo: 100,
          speed: 200,
          trainingTime: 150,
        }),
      },
    },
  },

  PointMultipliers: {
    keys: [],
    levels: {
      [MUDEnums.EResource.indexOf("Iron")]: { P_PointMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Copper")]: { P_PointMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Lithium")]: { P_PointMultiplier: { value: 1n } },
      [MUDEnums.EResource.indexOf("Titanium")]: { P_PointMultiplier: { value: 75n } },
      [MUDEnums.EResource.indexOf("Iridium")]: { P_PointMultiplier: { value: 300n } },
      [MUDEnums.EResource.indexOf("Kimberlite")]: { P_PointMultiplier: { value: 800n } },
      [MUDEnums.EResource.indexOf("Platinum")]: { P_PointMultiplier: { value: 150n } },
      [MUDEnums.EResource.indexOf("IronPlate")]: { P_PointMultiplier: { value: 5n } },
      [MUDEnums.EResource.indexOf("PVCell")]: { P_PointMultiplier: { value: 5n } },
      [MUDEnums.EResource.indexOf("Alloy")]: { P_PointMultiplier: { value: 5n } },
    },
  },

  /* ------------------------------- Objectives ------------------------------- */
  Objectives: {
    levels: idsToPrototypes(MUDEnums.EObjectives),
  },

  /* ---------------------------------- A Fundamentals --------------------------------- */

  /*//////////////////////////////////////////////////////////////
                          Build Mines
  //////////////////////////////////////////////////////////////*/
  BuildIronMine: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 50 }),
    },
  },
  BuildCopperMine: {
    tables: {
      P_ResourceReward: getResourceValues({ Copper: 50 }),
    },
  },
  BuildLithiumMine: {
    tables: {
      P_ResourceReward: getResourceValues({ Lithium: 50 }),
    },
  },

  /*//////////////////////////////////////////////////////////////
                          Main Base
  //////////////////////////////////////////////////////////////*/
  UpgradeMainBase2: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
  },
  UpgradeMainBase3: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },
  UpgradeMainBase4: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },
  UpgradeMainBase5: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },

  /*//////////////////////////////////////////////////////////////
                          Expand Base
  //////////////////////////////////////////////////////////////*/
  ExpandBase2: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
  },
  ExpandBase3: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },
  ExpandBase4: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },

  /*//////////////////////////////////////////////////////////////
                          Upgrade Mines
  //////////////////////////////////////////////////////////////*/
  UpgradeIronMine2: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100 }),
    },
  },
  UpgradeIronMine3: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250 }),
    },
  },

  UpgradeCopperMine2: {
    tables: {
      P_ResourceReward: getResourceValues({ Copper: 100 }),
    },
  },
  UpgradeCopperMine3: {
    tables: {
      P_ResourceReward: getResourceValues({ Copper: 250 }),
    },
  },

  UpgradeLithiumMine2: {
    tables: {
      P_ResourceReward: getResourceValues({ Lithium: 100 }),
    },
  },
  UpgradeLithiumMine3: {
    tables: {
      P_ResourceReward: getResourceValues({ Lithium: 250 }),
    },
  },

  /* ----------------------------- A-A Military Basics ---------------------------- */
  BuildGarage: {
    tables: {
      P_UnitReward: getUnitValues({ MinutemanMarine: 5, AnvilDrone: 5, HammerDrone: 5 }),
    },
  },
  UpgradeGarage: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 50, Copper: 50, Lithium: 50 }),
      P_UnitReward: getUnitValues({ LightningCraft: 5 }),
    },
  },
  BuildWorkshop: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 150, Copper: 100, Lithium: 150 }),
    },
  },
  UpgradeWorkshop: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 150, Lithium: 250 }),
    },
  },

  /* ------------------------------ A-A-A Fleet ------------------------------ */
  CreateFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  TransferFromAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  TransferFromFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  SendFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },

  /* ------------------------------ A-A-A-A Fleet Combat ------------------------------ */

  BattleAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  OpenBattleReport: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  BattleFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 250, Copper: 250, Lithium: 250 }),
    },
  },

  /* -------------------------- A-A-A-B Conquest (continued) ------------------------- */
  BuildShipyard: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
      P_UnitReward: getUnitValues({ LightningCraft: 10 }),
    },
  },
  UpgradeShipyard2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  TrainColonyShip: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
    },
  },
  DecryptAttack: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  CaptureAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
      P_UnitReward: getUnitValues({ LightningCraft: 10 }),
    },
  },

  /* --------------------- A-A-A-B-A Motherlode Extraction -------------------- */
  CaptureMotherlodeAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ Titanium: 25, Iridium: 25, Platinum: 25 }),
    },
  },
  ExtractMotherlodeResource: {
    tables: {
      P_ResourceReward: getResourceValues({ Titanium: 10, Iridium: 10, Platinum: 10 }),
    },
  },

  /* ------------------------ A-A-A-B-B Primodium Points ----------------------- */

  EarnPrimodiumOnAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ Kimberlite: 10 }),
    },
  },
  EarnPrimodiumOnShard: {
    tables: {
      P_ResourceReward: getResourceValues({ Kimberlite: 10 }),
    },
  },
  ExplodeShard: {
    tables: {
      P_ResourceReward: getResourceValues({ Kimberlite: 25 }),
    },
  },
  /* ------------------------- A-A-A-B-C Wormhole Points ------------------------ */

  CaptureWormholeAsteroid: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
    },
  },
  TeleportResources: {
    tables: {
      P_UnitReward: getUnitValues({ LightningCraft: 10 }),
    },
  },

  /* ------------------------ A-A-A-C Fleet Management ------------------------ */
  BuildStarmapper: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
      P_UnitReward: getUnitValues({ LightningCraft: 10 }),
    },
  },
  UpgradeStarmapper2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  DefendWithFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  BlockWithFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  LandFleet: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },

  /* ----------------------- A-A-B Unit Production ---------------------- */
  TrainMinutemanMarine: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
  },
  TrainTridentMarine: {
    tables: {
      P_ResourceReward: getResourceValues({ Alloy: 100 }),
    },
  },
  TrainLightningCraft: {
    tables: {
      P_ResourceReward: getResourceValues({ Kimberlite: 10 }),
    },
  },

  /* --------------------- A-A-B-A Unit Management (cont) --------------------- */
  UpgradeUnit: {
    tables: {
      P_ResourceReward: getResourceValues({ Titanium: 10, Iridium: 10, Platinum: 10, Kimberlite: 5 }),
    },
  },

  /* --------------------- A-A-B-A Unit Production (cont) --------------------- */
  BuildDroneFactory: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
    },
  },
  UpgradeDroneFactory2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  TrainAnvilDrone: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25 }),
    },
  },
  TrainHammerDrone: {
    tables: {
      P_ResourceReward: getResourceValues({ PVCell: 25 }),
    },
  },
  TrainAegisDrone: {
    tables: {
      P_ResourceReward: getResourceValues({ Titanium: 10 }),
    },
  },
  TrainStingerDrone: {
    tables: {
      P_ResourceReward: getResourceValues({ Platinum: 10 }),
    },
  },

  /* --------------------- A-A-B-C Unit Storage --------------------- */
  BuildHangar: {
    tables: {
      P_UnitReward: getUnitValues({ AnvilDrone: 5, HammerDrone: 5, LightningCraft: 10 }),
    },
  },
  UpgradeHanger2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },

  /* ------------------------------ A-A-C Defense ----------------------------- */

  BuildShieldGenerator: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
    },
  },
  UpgradeShieldGenerator2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 100, Alloy: 100, PVCell: 100 }),
    },
  },
  BuildVault: {
    tables: {
      P_UnitReward: getUnitValues({ AnvilDrone: 5 }),
    },
  },
  UpgradeVault2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  BuildSAMLauncher: {
    tables: {
      P_UnitReward: getUnitValues({ HammerDrone: 5 }),
    },
  },
  UpgradeSAMLauncher2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },

  /* ----------------------------- A-B Production ----------------------------- */
  BuildStorageUnit: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
  },
  UpgradeStorageUnit2: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 200, Copper: 200, Lithium: 200 }),
    },
  },
  BuildIronPlateFactory: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  UpgradeIronPlateFactory2: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 50 }),
    },
  },
  BuildAlloyFactory: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  UpgradeAlloyFactory2: {
    tables: {
      P_ResourceReward: getResourceValues({ Alloy: 50 }),
    },
  },
  BuildPVCellFactory: {
    tables: {
      P_ResourceReward: getResourceValues({ IronPlate: 25, Alloy: 25, PVCell: 25 }),
    },
  },
  UpgradePVCellFactory2: {
    tables: {
      P_ResourceReward: getResourceValues({ PVCell: 50 }),
    },
  },

  /* ------------------------ A-B-A Production ----------------------- */

  BuildSolarPanel: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
  },
  UpgradeSolarPanel2: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 100, Copper: 100, Lithium: 100 }),
    },
    levels: {},
  },

  /* ------------------------------ A-B-B Market ------------------------------ */
  BuildMarket: {
    tables: {
      P_ResourceReward: getResourceValues({ Titanium: 1, Iridium: 1, Platinum: 1, Kimberlite: 1 }),
    },
  },
  MarketSwap: {
    tables: {
      P_ResourceReward: getResourceValues({ Kimberlite: 1 }),
    },
  },

  /* ------------------------------- A-C Alliance ------------------------------ */

  JoinAlliance: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
      P_UnitReward: getUnitValues({ LightningCraft: 5 }),
    },
  },
  JoinDiscord: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  FollowTwitter: {
    tables: {
      P_ResourceReward: getResourceValues({ Iron: 25, Copper: 25, Lithium: 25 }),
    },
  },
  PrimoPlayer: {
    tables: {
      P_UnitReward: getUnitValues({ LightningCraft: 10 }),
    },
  },
};
