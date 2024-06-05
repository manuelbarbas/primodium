import { KeySchema } from "@latticexyz/protocol-parser/internal";
import { Component, Schema } from "@latticexyz/recs";
import { ChainConfig } from "@/network/config/chainConfigs";
import { createNetwork } from "@/network/createNetwork";
import { createComponents } from "@/components/createComponents";
import { createExternalAccount } from "@/account/createExternalAccount";
import { createBurnerAccount } from "@/account/createBurnerAccount";
import { Hex } from "viem";
import { createUtils } from "@/utils/core";

export type CoreConfig = {
  chain: ChainConfig;
  worldAddress: string;
  initialBlockNumber: bigint;
  playerAddress?: Hex;
  devPrivateKey?: Hex;
  accountLinkUrl?: string;
};

export type CreateNetworkResult = Awaited<ReturnType<typeof createNetwork>>;
export type Components = ReturnType<typeof createComponents>;
export type Utils = ReturnType<typeof createUtils>;

export type Core = {
  config: CoreConfig;
  network: CreateNetworkResult;
  components: Components;
  utils: Utils;
};

export type BurnerAccount = Awaited<ReturnType<typeof createBurnerAccount>>;
export type ExternalAccount = Awaited<ReturnType<typeof createExternalAccount>>;
export type AnyAccount = BurnerAccount | ExternalAccount;

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
