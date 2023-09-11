import { Type } from "@latticexyz/recs";
import { world } from "../world";
import {
  createExtendedBoolComponent,
  createExtendedComponent,
  createExtendedCoordComponent,
  createExtendedEntityComponent,
  createExtendedNumberComponent,
} from "./customComponents/ExtendedComponent";

/* -------------------------------------------------------------------------- */
/*                                     Dev                                    */
/* -------------------------------------------------------------------------- */
export const DoubleCounter = createExtendedNumberComponent(world, {
  id: "DoubleCounter",
});

/* -------------------------------------------------------------------------- */
/*                                 Chain State                                */
/* -------------------------------------------------------------------------- */
export const BlockNumber = createExtendedComponent(
  world,
  {
    value: Type.Number,
    avgBlockTime: Type.Number, //seconds
  },
  {
    id: "BlockNumber",
  }
);
export const Account = createExtendedEntityComponent(world, { id: "Account" });
export const GameReady = createExtendedBoolComponent(world, { id: "GameReady" });
export const ActiveAsteroid = createExtendedComponent(world, { value: Type.Entity }, { id: "ActiveAsteroid" });

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

/* -------------------------------------------------------------------------- */
/*                                    Units                                   */
/* -------------------------------------------------------------------------- */
// export const Send = createExtendedSendComponent(world);

export const TrainingQueue = createExtendedComponent(
  world,
  {
    units: Type.EntityArray,
    counts: Type.NumberArray,
    progress: Type.NumberArray,
    timeRemaining: Type.NumberArray,
  },
  {
    id: "TrainingQueue",
  }
);

export const Hangar = createExtendedComponent(
  world,
  {
    units: Type.EntityArray,
    counts: Type.NumberArray,
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

/* -------------------------------------------------------------------------- */
/*                                   Battle                                   */
/* -------------------------------------------------------------------------- */
// export const Battle = BattleComponent();
export const BattleReport = createExtendedComponent(
  world,
  {
    show: Type.Boolean,
    battle: Type.OptionalEntity,
  },
  {
    id: "Battle",
  }
);

/* -------------------------------------------------------------------------- */
/*                                Notifications                               */
/* -------------------------------------------------------------------------- */
// export const NotificationQueue = NotificationQueueComponent();

export default {
  /* ----------------------------------- Dev ---------------------------------- */
  DoubleCounter,

  /* ------------------------------ Chain State ------------------------------- */
  BlockNumber,
  Account,
  GameReady,
  ActiveAsteroid,
  CurrentTransaction,

  /* ---------------------------------- Input --------------------------------- */
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,

  /* ---------------------------------- Units --------------------------------- */
  TrainingQueue,
  Hangar,

  /* ------------------------------ Leaderboard ------------------------------- */
  Leaderboard,

  /* --------------------------------- Battle --------------------------------- */
  BattleReport,

  /* ------------------------------ Notifications ----------------------------- */
  // NotificationQueue
};
