import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "upgradeBounty",
  systems: {
    AgreementMembersSystem: {
      // Don't think this one is necessary
      openAccess: true,
      name: "AgreementMembersSystem",
    },
    BuildingUpgradeBountySystem: {
      openAccess: true,
      name: "BuildingUpgradeBountySystem",
      // deposits and withdrawals track the depositor and amount
    },
    MessageSystem: {
      name: "MessageSystem",
      openAccess: true,
    },
  },
  tables: {
    Counter: {
      keySchema: {},
      valueSchema: "uint32",
    },
    Messages: {
      keySchema: {
        counterValue: "uint32",
      },
      valueSchema: {
        message: "string",
      },
    },
    UpgradeBounty: {
      keySchema: {
        depositor: "address",
        buildingEntity: "bytes32",
      },
      valueSchema: "uint256",
    },

    /* --------------------------------- Common --------------------------------- */
    // if the key is a player, value is their home asteroid.
    // if the key is an asteroid, value is its main base.
    Home: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bytes32",
    },

    P_GameConfig: {
      keySchema: {},
      valueSchema: {
        admin: "address",
        unitProductionRate: "uint256",
        travelTime: "uint256",
        worldSpeed: "uint256",
        tax: "uint256",
        maxAsteroidsPerPlayer: "uint256",
        asteroidChanceInv: "uint256",
        asteroidDistance: "uint256",
      },
    },

    P_ColonyShipConfig: {
      keySchema: {},
      valueSchema: {
        resourceType: "uint8",
        resourceAmount: "uint256",
      },
    },

    Position: {
      keySchema: { entity: "bytes32" },
      valueSchema: {
        x: "int32",
        y: "int32",
        parent: "bytes32",
      },
    },

    ReversePosition: {
      keySchema: { x: "int32", y: "int32" },
      valueSchema: {
        entity: "bytes32",
      },
    },

    OwnedBy: {
      keySchema: { entity: "bytes32" },
      valueSchema: {
        value: "bytes32",
      },
    },

    Level: {
      keySchema: { entity: "bytes32" },
      valueSchema: "uint256",
    },

    Spawned: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bool",
    },

    /* --------------------------- Build Requirements --------------------------- */
    P_RequiredTile: {
      keySchema: { prototype: "bytes32" },
      valueSchema: "uint8", // EResource
    },
    P_RequiredBaseLevel: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: "uint256",
    },

    P_RequiredResources: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: {
        // mud doesnt recognize EResource arrays so we will manually convert them
        resources: "uint8[]",
        amounts: "uint256[]",
      },
    },

    P_RequiredDependency: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: {
        // mud doesnt recognize EResource arrays so we will manually convert them
        resource: "uint8",
        amount: "uint256",
      },
    },

    P_RequiredUpgradeResources: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: {
        resources: "uint8[]",
        amounts: "uint256[]",
      },
    },

    /* -------------------------------- Buildings ------------------------------- */

    P_Blueprint: {
      keySchema: { prototype: "bytes32" },
      valueSchema: "int32[]",
    },

    P_MaxLevel: {
      keySchema: { prototype: "bytes32" },
      valueSchema: "uint256",
    },

    P_Production: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: {
        // mud doesnt recognize EResource arrays so we will manually convert them
        // EResource
        resources: "uint8[]",
        amounts: "uint256[]",
      },
    },

    P_UnitProdTypes: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: "bytes32[]",
    },

    P_UnitProdMultiplier: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: "uint256",
    },

    SetItemUnitFactories: {
      keySchema: { entity: "bytes32", building: "bytes32" },
      valueSchema: {
        stored: "bool",
        index: "uint256",
      },
    },

    SetUnitFactories: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bytes32[]",
    },

    P_ByLevelMaxResourceUpgrades: {
      keySchema: { prototype: "bytes32", resource: "uint8", level: "uint256" },
      valueSchema: "uint256",
    },

    P_ListMaxResourceUpgrades: {
      keySchema: { prototype: "bytes32", level: "uint256" },
      valueSchema: "uint8[]",
    },

    P_ConsumesResource: {
      keySchema: { resource: "uint8" },
      valueSchema: "uint8",
    },

    BuildingType: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bytes32",
    },

    Children: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bytes32[]",
    },

    ProductionRate: {
      keySchema: { entity: "bytes32", resource: "uint8" },
      valueSchema: "uint256",
    },

    ConsumptionRate: {
      keySchema: { entity: "bytes32", resource: "uint8" },
      valueSchema: "uint256",
    },

    IsActive: {
      keySchema: { entity: "bytes32" },
      valueSchema: "bool",
    },
  },
});
