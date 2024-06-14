import { createBattleTables } from "./customTables/BattleTables";
import {
  createLocalTable,
  createLocalBigIntTable,
  createLocalBoolTable,
  createLocalCoordTable,
  createLocalEntityTable,
  createLocalNumberTable,
  Type,
} from "@primodiumxyz/reactive-tables";
import { createTransactionQueueTable } from "./customTables/TransactionQueueTable";
import { CreateNetworkResult } from "@/lib/types";

export default function setupCoreTables(network: CreateNetworkResult) {
  const world = network.world;

  const DoubleCounter = createLocalBigIntTable(world, { id: "DoubleCounter" });

  const BlockNumber = createLocalTable(
    world,
    {
      value: Type.BigInt,
      avgBlockTime: Type.Number,
    },
    {
      id: "BlockNumber",
    }
  );

  const Time = createLocalBigIntTable(world, { id: "Time" });
  const Account = createLocalEntityTable(world, { id: "Account" });
  const SelectedRock = createLocalEntityTable(world, { id: "SelectedRock" });
  const ActiveRock = createLocalEntityTable(world, { id: "ActiveRock" });
  const BuildRock = createLocalEntityTable(world, { id: "BuildRock" });
  const CurrentTransaction = createLocalBoolTable(world, { id: "CurrentTransaction" });

  const SelectedTile = createLocalCoordTable(world, { id: "SelectedTile" });
  const HoverTile = createLocalCoordTable(world, { id: "HoverTile" });
  const HoverEntity = createLocalEntityTable(world, { id: "HoverEntity" });
  const SelectedBuilding = createLocalTable(world, { value: Type.Entity }, { id: "SelectedBuilding" });
  const SelectedAction = createLocalNumberTable(world, { id: "SelectedAction" });
  const SelectedMode = createLocalEntityTable(world, { id: "SelectedMode" });

  const WormholeResource = createLocalTable(
    world,
    {
      timeUntilNextResource: Type.BigInt,
      nextResource: Type.Entity,
      resource: Type.Entity,
    },
    { id: "WormholeData" }
  );

  const ReverseBuildingPosition = createLocalEntityTable(world, { id: "ReverseBuildingPosition" });

  const TrainingQueue = createLocalTable(
    world,
    {
      units: Type.EntityArray,
      counts: Type.BigIntArray,
      progress: Type.BigIntArray,
      timeRemaining: Type.BigIntArray,
    },
    {
      id: "TrainingQueue",
    }
  );

  const Hangar = createLocalTable(
    world,
    {
      units: Type.EntityArray,
      counts: Type.BigIntArray,
    },
    {
      id: "Hangar",
    }
  );

  const SelectedFleet = createLocalEntityTable(world, { id: "SelectedFleet" });

  const Battle = createBattleTables(network);

  const BattleRender = createLocalEntityTable(world, { id: "BattleRender" });

  const BattleTarget = createLocalEntityTable(world, { id: "BattleTarget" });

  const PlayerInvite = createLocalTable(
    world,
    {
      target: Type.Entity,
      alliance: Type.Entity,
      player: Type.Entity,
      timestamp: Type.BigInt,
    },
    {
      id: "PlayerInvites",
    }
  );

  const AllianceRequest = createLocalTable(
    world,
    {
      player: Type.Entity,
      alliance: Type.Entity,
      timestamp: Type.BigInt,
    },
    {
      id: "AllianceRequests",
    }
  );

  const TransactionQueue = createTransactionQueueTable(network, { id: "TransactionQueue" });

  const SystemsReady = createLocalBoolTable(world, { id: "SystemsReady" });

  const IsObjectiveClaimable = createLocalBoolTable(world, { id: "IsObjectiveClaimable" });
  /* -------------------------------------------------------------------------- */
  /*                                 Leaderboard                                */
  /* -------------------------------------------------------------------------- */
  const Leaderboard = createLocalTable(
    world,
    {
      players: Type.EntityArray,
      points: Type.BigIntArray,
      ranks: Type.NumberArray,
    },
    {
      id: "Leaderboard",
    }
  );

  return {
    DoubleCounter,
    BlockNumber,
    Time,
    Account,
    SelectedRock,
    ActiveRock,
    BattleTarget,
    BuildRock,
    CurrentTransaction,
    SelectedTile,
    HoverTile,
    HoverEntity,
    SelectedBuilding,
    SelectedAction,
    SelectedMode,
    ReverseBuildingPosition,
    TrainingQueue,
    Hangar,
    SelectedFleet,
    IsObjectiveClaimable,
    Battle,
    BattleRender,
    Leaderboard,
    PlayerInvite,
    AllianceRequest,
    TransactionQueue,
    SystemsReady,
    WormholeResource,
  };
}
