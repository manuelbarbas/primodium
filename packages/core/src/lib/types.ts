import { KeySchema } from "@latticexyz/protocol-parser/internal";
import { Component, Entity, Schema } from "@latticexyz/recs";
import { ChainConfig } from "@/network/config/chainConfigs";
import { createNetwork } from "@/network/createNetwork";
import { createComponents } from "@/components/createComponents";
import {
  Account,
  Address,
  CustomTransport,
  FallbackTransport,
  GetContractReturnType,
  Hex,
  PublicClient,
  WalletClient,
} from "viem";
import { createUtils } from "@/utils/core";
import { createSync } from "@/sync";
import { WorldAbi } from "@/lib/WorldAbi";
import { ContractWrite } from "@latticexyz/common";
import { Subject } from "rxjs";

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

type _Account<
  IsLocalAccount extends boolean = false,
  TPublicClient extends PublicClient = PublicClient<FallbackTransport, ChainConfig>,
  TWalletClient extends WalletClient = IsLocalAccount extends true
    ? WalletClient<FallbackTransport, ChainConfig, Account>
    : WalletClient<CustomTransport, ChainConfig, Account>
> = {
  worldContract: GetContractReturnType<
    typeof WorldAbi,
    {
      public: TPublicClient;
      wallet: TWalletClient;
    },
    Address
  >;
  account: Account;
  address: Address;
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  entity: Entity;
  write$: Subject<ContractWrite>;
  privateKey: IsLocalAccount extends true ? Hex : null;
};

export type ExternalAccount = _Account<false>;
export type LocalAccount = _Account<true>;

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
