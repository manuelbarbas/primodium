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
  },
  {
    id: "AllianceRequests",
  }
);

export default {
  /* ----------------------------------- Dev ---------------------------------- */
  DoubleCounter,

  /* ------------------------------ Chain State ------------------------------- */
  BlockNumber,
  Account,
  GameReady,
  CurrentTransaction,

  /* ---------------------------------- Input --------------------------------- */
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
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
};
