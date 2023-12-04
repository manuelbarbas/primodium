import { Type } from "@latticexyz/recs";
import { world } from "../world";
import { createArrivalComponent } from "./customComponents/ArrivalComponent";
import {
  createExtendedBigIntComponent,
  createExtendedBoolComponent,
  createExtendedComponent,
  createExtendedCoordComponent,
  createExtendedEntityComponent,
  createExtendedNumberComponent,
} from "./customComponents/ExtendedComponent";
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
export const Account = createExtendedEntityComponent(world, { id: "Account" });
export const SelectedRock = createExtendedEntityComponent(world, { id: "SelectedRock" });
export const SpectateAccount = createExtendedEntityComponent(world, { id: "SpectateAccount" });
export const GameReady = createExtendedBoolComponent(world, { id: "GameReady" });

// Todo: extend this with relevant tx data
export const CurrentTransaction = createExtendedBoolComponent(world, { id: "CurrentTransaction" });

/* -------------------------------------------------------------------------- */
/*                                    Input                                   */
/* -------------------------------------------------------------------------- */
export const SelectedTile = createExtendedCoordComponent(world, { id: "SelectedTile" });
export const HoverTile = createExtendedCoordComponent(world, { id: "HoverTile" });
export const SelectedBuilding = createExtendedComponent(world, { value: Type.Entity }, { id: "SelectedBuilding" });
export const SelectedAction = createExtendedNumberComponent(world, {
  id: "SelectedAction",
});
export const MapOpen = createExtendedBoolComponent(world, { id: "MapOpen" });

/* -------------------------------------------------------------------------- */
/*                                  RESOURCES                                 */
/* -------------------------------------------------------------------------- */
export const PlayerResources = createExtendedComponent(
  world,
  {
    resourcesCount: Type.OptionalBigInt,
    resourceToClaim: Type.OptionalBigInt,
    resourceStorage: Type.OptionalBigInt,
    production: Type.OptionalBigInt,
    producedResource: Type.OptionalBigInt,
  },
  {
    id: "PlayerResources",
  }
);

export const SelectedRockResources = createExtendedComponent(
  world,
  {
    resourcesCount: Type.OptionalBigInt,
    resourceToClaim: Type.OptionalBigInt,
    resourceStorage: Type.OptionalBigInt,
    production: Type.OptionalBigInt,
    producedResource: Type.OptionalBigInt,
  },
  {
    id: "SelectedRockResources",
  }
);

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
/*                                 Leaderboard                                */
/* -------------------------------------------------------------------------- */
export const Leaderboard = createExtendedComponent(
  world,
  {
    players: Type.EntityArray,
    playerRank: Type.Number,
    scores: Type.NumberArray,
  },
  {
    id: "Leaderboard",
  }
);

export const AllianceLeaderboard = createExtendedComponent(
  world,
  {
    alliances: Type.EntityArray,
    playerAllianceRank: Type.Number,
    scores: Type.BigIntArray,
  },
  {
    id: "AllianceLeaderboard",
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Battle                                   */
/* -------------------------------------------------------------------------- */
const Arrival = createArrivalComponent();
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

export default {
  /* ----------------------------------- Dev ---------------------------------- */
  DoubleCounter,

  /* ------------------------------ Chain State ------------------------------- */
  BlockNumber,
  SpectateAccount,
  Account,
  GameReady,
  CurrentTransaction,

  /* ------------------------------- Resources -------------------------------- */
  PlayerResources,
  SelectedRockResources,

  /* ---------------------------------- Input --------------------------------- */
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
  SelectedRock,
  MapOpen,

  /* ---------------------------------- Units --------------------------------- */
  TrainingQueue,
  Hangar,

  /* ------------------------------ Leaderboard ------------------------------- */
  Leaderboard,
  AllianceLeaderboard,

  /* --------------------------------- Battle --------------------------------- */
  Arrival,

  /* ------------------------------- Alliances -------------------------------- */
  PlayerInvite,
  AllianceRequest,
  /* ----------------------------- Transaction ------------------------------- */
  TransactionQueue,
};
