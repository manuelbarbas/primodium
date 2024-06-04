import { resourceToHex } from "@latticexyz/common";

const UserDelegationControlTableId = resourceToHex({ type: "table", namespace: "", name: "UserDelegationControl" });
const CallWithSignatureNoncesTableId = resourceToHex({ type: "table", namespace: "", name: "CallWithSignatur" });

export const otherTables = {
  UserDelegationControl: {
    namespace: "world",
    name: "UserDelegationControl",
    tableId: UserDelegationControlTableId,
    keySchema: {
      delegator: { type: "address" },
      delegatee: { type: "address" },
    },
    valueSchema: {
      delegationControlId: {
        type: "bytes32",
      },
    },
  },
  CallWithSignatureNonces: {
    namespace: "world",
    name: "CallWithSignatureNonces",
    tableId: CallWithSignatureNoncesTableId,
    keySchema: {
      signer: { type: "address" },
    },
    valueSchema: {
      nonce: {
        type: "uint256",
      },
    },
  },
} as const;
