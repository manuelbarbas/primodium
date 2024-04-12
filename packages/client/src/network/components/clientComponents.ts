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

/* -------------------------------------------------------------------------- */
/*                                     Dev                                    */
/* -------------------------------------------------------------------------- */
export const DoubleCounter = createExtendedBigIntComponent(world, {
  id: "DoubleCounter",
});

/* -------------------------------------------------------------------------- */
/*                                 Chain State                                */
/* -------------------------------------------------------------------------- */
export const BlockNumber = createExtendedComponent(
  world,
  {
    value: Type.BigInt,
    avgBlockTime: Type.Number, //seconds
  },
  {
    id: "BlockNumber",
  }
);

export const Time = createExtendedBigIntComponent(world, { id: "Time" });
export const Account = createExtendedEntityComponent(world, { id: "Account" });
export const SelectedRock = createExtendedEntityComponent(world, { id: "SelectedRock" });
export const ActiveRock = createExtendedEntityComponent(world, { id: "ActiveRock" });
export const BuildRock = createExtendedEntityComponent(world, { id: "BuildRock" });

// Todo: extend this with relevant tx data
export const CurrentTransaction = createExtendedBoolComponent(world, { id: "CurrentTransaction" });

/* -------------------------------------------------------------------------- */
/*                                    Input                                   */
/* -------------------------------------------------------------------------- */
export const SelectedTile = createExtendedCoordComponent(world, { id: "SelectedTile" });
export const HoverTile = createExtendedCoordComponent(world, { id: "HoverTile" });
export const HoverEntity = createExtendedEntityComponent(world, { id: "HoverEntity" });
export const SelectedBuilding = createExtendedComponent(world, { value: Type.Entity }, { id: "SelectedBuilding" });
export const SelectedAction = createExtendedNumberComponent(world, {
  id: "SelectedAction",
});
export const MapOpen = createExtendedBoolComponent(world, { id: "MapOpen" });

/* -------------------------------------------------------------------------- */
/*                                  Buildings                                 */
/* -------------------------------------------------------------------------- */

export const ReverseBuildingPosition = createExtendedEntityComponent(world, { id: "ReverseBuildingPosition" });
/* -------------------------------------------------------------------------- */
/*                                    Units                                   */
/* -------------------------------------------------------------------------- */

export const TrainingQueue = createExtendedComponent(
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

export const Hangar = createExtendedComponent(
  world,
  {
    units: Type.EntityArray,
    counts: Type.BigIntArray,
  },
  {
    id: "Hangar",
  }
);

/* -------------------------------------------------------------------------- */
/*                                    Fleet                                   */
/* -------------------------------------------------------------------------- */

export const Send = createSendComponent();
export const Attack = createSendComponent();

export const SelectedFleet = createExtendedEntityComponent(world, { id: "SelectedFleet" });

export const Battle = createBattleComponents();

// this component is used to freeze orbiting of fleets when a battle is rendering
export const BattleRender = createExtendedEntityComponent(world, { id: "BattleRender" });

/* -------------------------------------------------------------------------- */
/*                                 Leaderboard                                */
/* -------------------------------------------------------------------------- */
export const Leaderboard = createExtendedComponent(
  world,
  {
    players: Type.EntityArray,
    playerRank: Type.OptionalNumber,
    scores: Type.BigIntArray,
  },
  {
    id: "Leaderboard",
  }
);

export const GrandLeaderboard = createExtendedComponent(world, {
  players: Type.EntityArray,
  wormholeRanks: Type.NumberArray,
  primodiumRanks: Type.NumberArray,
  scores: Type.NumberArray,
  playerRank: Type.OptionalNumber,
});
/* -------------------------------------------------------------------------- */
/*                                 Objectives                                 */
/* -------------------------------------------------------------------------- */

export const IsObjectiveClaimable = createExtendedBoolComponent(world, {
  id: "IsObjectiveClaimable",
});
/* -------------------------------------------------------------------------- */
/*                                  ALLIANCES                                 */
/* -------------------------------------------------------------------------- */
export const PlayerInvite = createExtendedComponent(
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

export const AllianceRequest = createExtendedComponent(
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

/* -------------------------------------------------------------------------- */
/*                              TRANSACTION QUEUE                             */
/* -------------------------------------------------------------------------- */
export const TransactionQueue = createTransactionQueueComponent({
  id: "TransactionQueue",
});

/* -------------------------------------------------------------------------- */
/*                                    SYNC                                    */
/* -------------------------------------------------------------------------- */
export const SyncStatus = createExtendedComponent(
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

export const SyncSource = createExtendedNumberComponent(world, {
  id: "SyncSource",
});

export default {
  /* ----------------------------------- Dev ---------------------------------- */
  DoubleCounter,

  /* ------------------------------ Chain State ------------------------------- */
  BlockNumber,
  Time,
  Account,
  CurrentTransaction,

  /* ---------------------------------- Input --------------------------------- */
  SelectedTile,
  HoverEntity,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
  SelectedRock,
  ActiveRock,
  BuildRock,
  MapOpen,

  /* -------------------------------- Buildings ------------------------------- */
  ReverseBuildingPosition,

  /* ---------------------------------- Units --------------------------------- */
  TrainingQueue,
  Hangar,

  /* --------------------------------- Fleets --------------------------------- */
  Send,
  Attack,
  SelectedFleet,
  Battle,
  BattleRender,

  /* ------------------------------ Leaderboard ------------------------------- */
  Leaderboard,
  GrandLeaderboard,

  /* -------------------------------- Objective ------------------------------- */
  IsObjectiveClaimable,
  /* ------------------------------- Alliances -------------------------------- */
  PlayerInvite,
  AllianceRequest,
  /* ----------------------------- Transaction ------------------------------- */
  TransactionQueue,
  /* ---------------------------------- Sync ---------------------------------- */
  SyncStatus,
  SyncSource,
};
