import { resourceToHex } from "@latticexyz/common";

const ERC20RegistryTableId = resourceToHex({ type: "table", namespace: "erc20-puppet", name: "ERC20Registry" });
const wETHTableId = resourceToHex({ type: "table", namespace: "wETH", name: "Balances" });

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
} as const;
