import { KeySchema } from "@latticexyz/protocol-parser/internal";
import { Component, Entity, Schema } from "@latticexyz/recs";
import { ChainConfig } from "@/network/config/chainConfigs";
import { createNetwork } from "@/network/createNetwork";
import { createComponents } from "@/components/createComponents";
import { createBurnerAccount } from "@latticexyz/common";
import { createExternalAccount } from "@/account/createExternalAccount";
import { Address, Hex } from "viem";

export type NetworkConfig = {
  chainId: string;
  chain: ChainConfig;
  worldAddress: string;
  faucetServiceUrl?: string;
  initialBlockNumber?: bigint;
  indexerUrl?: string;
};

export type CreateNetworkResult = Awaited<ReturnType<typeof createNetwork>>;

export type Components = ReturnType<typeof createComponents>;

export type SetupResult = {
  network: CreateNetworkResult;
  components: Components;
};

export type BurnerAccount = Awaited<ReturnType<typeof createBurnerAccount>>;
export type ExternalAccount = Awaited<ReturnType<typeof createExternalAccount>>;
export type AnyAccount = BurnerAccount | ExternalAccount;

export type UseNetworkResult = Partial<SetupResult> & {
  sessionAccount: BurnerAccount | undefined;
  playerAccount: AnyAccount | undefined;
  requestDrip: (address: Address) => Promise<void>;
  updateSessionAccount: (pKey: Hex) => Promise<BurnerAccount>;
  removeSessionAccount: () => void;

  updatePlayerAccount(options: { address: Address }): void;
  updatePlayerAccount(options: { burner: true; privateKey?: Hex }): void;
};

export type MUD = UseNetworkResult &
  SetupResult & {
    playerAccount: AnyAccount;
  };

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

export enum TransactionQueueType {
  Build,
  Train,
  Research,
  Upgrade,
  Demolish,
  Move,
  ClaimObjective,
  CreateAlliance,
  JoinAlliance,
  UpdateAllianceAccess,
  UpdateAllianceName,
  RequestToJoin,
  KickPlayer,
  Promote,
  Demote,
  AcceptRequest,
  RejectRequest,
  Invite,
  RevokeInvite,
  DeclineInvite,
  LeaveAlliance,
  Toggle,
  Access,
  Attack,
  CreateFleet,
  ClearFleet,
  LandFleet,
  MergeFleets,
  AbandonFleet,
  SendFleet,
  FleetStance,
  TransferFleet,
  WormholeDeposit,
  PayForColonySlot,
}

export type TransactionQueueMetadataTypes = {
  [TransactionQueueType.Build]: {
    coord: { x: number; y: number };
    buildingType: Entity;
  };
};
