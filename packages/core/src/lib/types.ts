import { KeySchema } from "@latticexyz/protocol-parser/internal";
import { Component, Entity, EntitySymbol, Schema } from "@latticexyz/recs";
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
import { ContractWrite } from "@latticexyz/common";
import { ReplaySubject, Subject } from "rxjs";

import CallWithSignatureAbi from "@latticexyz/world-modules/out/Unstable_CallWithSignatureSystem.sol/Unstable_CallWithSignatureSystem.abi.json";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import setupCoreTables from "@/tables/coreTables";
import { Table } from "@latticexyz/store/internal";
import { ChainConfig } from "@/network/config/chainConfigs";
import { Recs } from "@/recs/setupRecs";
import { otherTables } from "@/network/otherTables";
import mudConfig from "contracts/mud.config";
import { ExtendedContractComponents } from "@/tables/customTables/extendComponents";
import { World as MudWorld } from "@latticexyz/recs";

/**
 * Core configuration
 */
export type CoreConfig = {
  /**
   * Chain configuration. Default configurations can be found in the {@link chainConfigs object chainConfigs} object
   */
  chain: ChainConfig;
  worldAddress: Address;
  initialBlockNumber?: bigint;
  /**
   * Used to fetch player data on initial sync when syncing from indexer
   */
  playerAddress?: Address;

  /**
   * Used to automatically drip eth to accounts in dev mode.
   *
   * If using anvil, this value is 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   */
  devPrivateKey?: Hex;
  /**
   * Used to fetch player ens names
   */
  accountLinkUrl?: string;

  /**
   * Run the default initial sync? (default: false)
   *
   * If using RPC, will hydrate full game state.
   * If using indexer, default sync only fetches prototype data and player data (if playerAddress is set)
   */
  runSync?: boolean;
  /**
   * Run the default initial systems? (default: false)
   *
   * Setups up systems to keep core tables and simplified tables in sync with contract tables
   */
  runSystems?: boolean;
};

export type World = MudWorld & {
  dispose: (namespace?: string) => void;
};

type MudConfig = typeof mudConfig;

/**
 * @typedef {Object} CreateNetworkResult
 * @property {Record<string, Table>} tableMetadata - Contains contract table metadata.
 * @property {MudConfig} mudConfig - Configuration for MUD.
 * @property {ExtendedContractComponents<Recs<MudConfig, typeof otherTables>["tables"]>} tables - The extended contract components.
 * @property {PublicClient<FallbackTransport, ChainConfig, undefined>} publicClient - The public client.
 * @property {Clock} clock - The clock instance.
 *
 * Contains contract table metadata.
 *
 * See [mud.config.ts](https://github.com/primodiumxyz/contracts/blob/main/mud.config.ts#L85-L97) for more details.
 */

export type CreateNetworkResult = Omit<Recs<MudConfig, typeof otherTables>, "tables"> & {
  /** @property {World} world - The world instance. */
  world: World;
  /** @property  */
  tableMetadata: Record<string, Table>;
  mudConfig: MudConfig;
  tables: ExtendedContractComponents<Recs<MudConfig, typeof otherTables>["tables"]>;
  publicClient: PublicClient<FallbackTransport, ChainConfig, undefined>;
  clock: Clock;
};
export type Tables = CreateNetworkResult["tables"] & ReturnType<typeof setupCoreTables>;
export type Utils = ReturnType<typeof createUtils>;
export type Sync = ReturnType<typeof createSync>;

export type Core = {
  /**
   * Chain configuration. Default configurations can be found in the {@link chainConfigs object chainConfigs} object
   */
  config: CoreConfig;
  network: CreateNetworkResult;
  /**
   * Tables contain data and methods to interact with game state. See [reactive tables](https://github.com/primodiumxyz/reactive-tables)
   */
  tables: Tables;
  utils: Utils;
  sync: Sync;
};

export type Clock = {
  currentTime: number;
  lastUpdateTime: number;
  time$: ReplaySubject<number>;
  dispose: () => void;
  update: (time: number) => void;
};

/**
 * World Abi. Combination of IWorld abi and CallWithSignature abi.
 */
export type WorldAbiType = ((typeof IWorldAbi)[number] | (typeof CallWithSignatureAbi)[number])[];

type _Account<
  IsLocalAccount extends boolean = false,
  TPublicClient extends PublicClient = PublicClient<FallbackTransport, ChainConfig>,
  TWalletClient extends WalletClient = IsLocalAccount extends true
    ? WalletClient<FallbackTransport, ChainConfig, Account>
    : WalletClient<CustomTransport, ChainConfig, Account>
> = {
  worldContract: GetContractReturnType<
    WorldAbiType,
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
