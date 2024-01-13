import { resourceToHex } from "@latticexyz/common";

const ERC20RegistryTableId = resourceToHex({ type: "table", namespace: "erc20-puppet", name: "ERC20Registry" });
const wETHTableId = resourceToHex({ type: "table", namespace: "wETH", name: "Balances" });
const UserDelegationControlTableId = resourceToHex({ type: "table", namespace: "", name: "UserDelegationControl" });

export const otherTables = {
  ERC20Registry: {
    namespace: "erc20-puppet",
    name: "ERC20Registry",
    tableId: ERC20RegistryTableId,
    keySchema: {
      namespaceId: { type: "bytes32" },
    },
    valueSchema: {
      erc20Address: { type: "address" },
    },
  },
  WETHBalance: {
    namespace: "wETH",
    name: "Balances",
    tableId: wETHTableId,
    keySchema: {
      account: { type: "address" },
    },
    valueSchema: {
      value: { type: "uint256" },
    },
  },
  UserDelegationControl: {
    namespace: "",
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
} as const;
