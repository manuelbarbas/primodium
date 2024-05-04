import { Type } from "@latticexyz/recs";
import { world } from "../world";
import { createBattleComponents } from "./customComponents/BattleComponents";
import {
  createExtendedBigIntComponent,
  createExtendedBoolComponent,
  createExtendedComponent,
  createExtendedCoordComponent,
  createExtendedEntityComponent,
  createExtendedNumberComponent,
} from "./customComponents/ExtendedComponent";
import createSendComponent from "./customComponents/SendComponent";
import { createTransactionQueueComponent } from "./customComponents/TransactionQueueComponent";

export default function setupClientComponents() {
  const DoubleCounter = createExtendedBigIntComponent(world, { id: "DoubleCounter" });

  const BlockNumber = createExtendedComponent(
    world,
    {
      value: Type.BigInt,
      avgBlockTime: Type.Number,
    },
    {
      id: "BlockNumber",
    }
  );

  const Time = createExtendedBigIntComponent(world, { id: "Time" });
  const Account = createExtendedEntityComponent(world, { id: "Account" });
  const SelectedRock = createExtendedEntityComponent(world, { id: "SelectedRock" });
  const ActiveRock = createExtendedEntityComponent(world, { id: "ActiveRock" });
  const BuildRock = createExtendedEntityComponent(world, { id: "BuildRock" });
  const CurrentTransaction = createExtendedBoolComponent(world, { id: "CurrentTransaction" });

  const SelectedTile = createExtendedCoordComponent(world, { id: "SelectedTile" });
  const HoverTile = createExtendedCoordComponent(world, { id: "HoverTile" });
  const HoverEntity = createExtendedEntityComponent(world, { id: "HoverEntity" });
  const SelectedBuilding = createExtendedComponent(world, { value: Type.Entity }, { id: "SelectedBuilding" });
  const SelectedAction = createExtendedNumberComponent(world, { id: "SelectedAction" });
  const SelectedMode = createExtendedEntityComponent(world, { id: "SelectedMode" });

  const ReverseBuildingPosition = createExtendedEntityComponent(world, { id: "ReverseBuildingPosition" });

  const TrainingQueue = createExtendedComponent(
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

  const Hangar = createExtendedComponent(
    world,
    {
      units: Type.EntityArray,
      counts: Type.BigIntArray,
    },
    {
      id: "Hangar",
    }
  );

  const Send = createSendComponent();
  const Attack = createSendComponent();

  const SelectedFleet = createExtendedEntityComponent(world, { id: "SelectedFleet" });

  const Battle = createBattleComponents();

  const BattleRender = createExtendedEntityComponent(world, { id: "BattleRender" });

  const PlayerInvite = createExtendedComponent(
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

  const AllianceRequest = createExtendedComponent(
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

  const TransactionQueue = createTransactionQueueComponent({ id: "TransactionQueue" });

  const SyncStatus = createExtendedComponent(
    world,
    {
      step: Type.Number,
      message: Type.String,
      progress: Type.Number,
    },
    {
      id: "SyncStatus",
    }
  );

  const IsObjectiveClaimable = createExtendedBoolComponent(world, { id: "IsObjectiveClaimable" });
  /* -------------------------------------------------------------------------- */
  /*                                 Leaderboard                                */
  /* -------------------------------------------------------------------------- */
  const Leaderboard = createExtendedComponent(
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

  const SyncSource = createExtendedNumberComponent(world, { id: "SyncSource" });

  return {
    DoubleCounter,
    BlockNumber,
    Time,
    Account,
    SelectedRock,
    ActiveRock,
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
    Send,
    Attack,
    SelectedFleet,
    IsObjectiveClaimable,
    Battle,
    BattleRender,
    Leaderboard,
    PlayerInvite,
    AllianceRequest,
    TransactionQueue,
    SyncStatus,
    SyncSource,
  };
}
