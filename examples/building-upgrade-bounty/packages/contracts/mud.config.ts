import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "upgradeBounty",
  systems: {
    UpgrBounSystem: {
      openAccess: true,
      name: "UpgrBounSystem",
      // deposits and withdrawals track the depositor and amount
    },
  },
  tables: {
    UpgradeBounty: {
      keySchema: {
        depositorEntity: "bytes32",
        buildingEntity: "bytes32",
      },
      valueSchema: { value: uint256 },
    },

    /* --------------------------------- Common --------------------------------- */

    Position: {
      schema: { entity: "bytes32", x: "int32", y: "int32", parent: "bytes32" },
    },

    OwnedBy: {
      schema: { entity: "bytes32", value: "bytes32" },
    },
  },
});
