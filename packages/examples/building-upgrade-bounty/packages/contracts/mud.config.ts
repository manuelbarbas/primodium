import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "upgrade_bounty",
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
  },
  tables: {
    Counter: {
      keySchema: {},
      valueSchema: "uint32",
    },
    Deposit: {
      keySchema: { depositor: "address" },
      valueSchema: "uint256",
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
