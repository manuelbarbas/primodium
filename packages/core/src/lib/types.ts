import { KeySchema } from "@latticexyz/protocol-parser/internal";
import { Component, Schema } from "@latticexyz/recs";
import { ChainConfig } from "@/network/config/chainConfigs";
import { createNetwork } from "@/network/createNetwork";
import { createComponents } from "@/components/createComponents";
import { createExternalAccount } from "@/account/createExternalAccount";
import { createLocalAccount } from "@/account/createLocalAccount";
import { Address, Hex } from "viem";
import { createUtils } from "@/utils/core";
import { createSync } from "@/sync";

export type CoreConfig = {
  chain: ChainConfig;
  worldAddress: Address;
  initialBlockNumber?: bigint;
  playerAddress?: Address;
  devPrivateKey?: Hex;
  accountLinkUrl?: string;

  runSync?: boolean;
  runSystems?: boolean;
};

export type CreateNetworkResult = Awaited<ReturnType<typeof createNetwork>>;
export type Components = ReturnType<typeof createComponents>;
export type Utils = ReturnType<typeof createUtils>;
export type Sync = ReturnType<typeof createSync>;

export type Core = {
  config: CoreConfig;
  network: CreateNetworkResult;
  components: Components;
  utils: Utils;
  sync: Sync;
};

export type LocalAccount = Awaited<ReturnType<typeof createLocalAccount>>;
export type ExternalAccount = Awaited<ReturnType<typeof createExternalAccount>>;

export interface AccountClient {
  sessionAccount: LocalAccount | null;
  playerAccount: ExternalAccount | LocalAccount;
  setPlayerAccount: (options: { playerAddress?: Address; playerPrivateKey?: Hex }) => void;
  setSessionAccount: (privateKey: Hex) => void;
  removeSessionAccount: () => void;
  requestDrip: (address: Address) => void;
}

export type ContractComponent<S extends Schema = Schema, TKeySchema extends KeySchema = KeySchema> = Component<
  S,
  {
    componentName: string;
    keySchema: TKeySchema;
    valueSchema: Record<string, string>;
  }
>;

export type Dimensions = { width: number; height: number };

export type Coord = {
  x: number;
  y: number;
};

export enum SyncSourceType {
  Indexer,
  RPC,
}

export enum SyncStep {
  Syncing,
  Error,
  Complete,
}

export enum Action {
  DemolishBuilding,
  SelectBuilding,
  PlaceBuilding,
  MoveBuilding,
}

export enum ResourceType {
  Resource,
  ResourceRate,
  Utility,
  Multiplier,
}

export enum RewardType {
  Resource,
  Unit,
}
