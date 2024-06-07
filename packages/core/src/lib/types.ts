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
import setupCoreComponents from "@/components/coreComponents";
import { Table } from "@latticexyz/store/internal";
import { ChainConfig } from "@/network/config/chainConfigs";
import { Recs } from "@/recs/setupRecs";
import { otherTables } from "@/network/otherTables";
import mudConfig from "contracts/mud.config";
import { ExtendedContractComponents } from "@/components/customComponents/extendComponents";

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

// they got their own type wrong
export type World = {
  registerEntity: (options?: { id?: string; idSuffix?: string }) => Entity;
  registerComponent: (component: Component) => void;
  components: Component[];
  getEntities: () => IterableIterator<Entity>;
  dispose: (namespace?: string) => void;
  registerDisposer: (disposer: () => void) => void;
  hasEntity: (entity: Entity) => boolean;
  deleteEntity: (entity: Entity) => void;
  entitySymbols: Set<EntitySymbol>;
};

type MudConfig = typeof mudConfig;

export type CreateNetworkResult = Omit<Recs<MudConfig, typeof otherTables>, "components"> & {
  world: World;
  tables: Record<string, Table>;
  mudConfig: MudConfig;
  components: ExtendedContractComponents<Recs<MudConfig, typeof otherTables>["components"]>;
  publicClient: PublicClient<FallbackTransport, ChainConfig, undefined>;
  clock: Clock;
};
export type Components = CreateNetworkResult["components"] & ReturnType<typeof setupCoreComponents>;
export type Utils = ReturnType<typeof createUtils>;
export type Sync = ReturnType<typeof createSync>;

export type Core = {
  config: CoreConfig;
  network: CreateNetworkResult;
  components: Components;
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
