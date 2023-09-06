import { Type } from "@latticexyz/recs";
import { world } from "../world";
import { BattleComponent } from "./customComponents/BattleComponent";
import {
  createExtendedBoolComponent,
  createExtendedComponent,
  createExtendedCoordComponent,
  createExtendedEntityComponent,
  createExtendedNumberComponent,
} from "./customComponents/ExtendedComponent";
import createExtendedMarkerComponent from "./customComponents/MarkerComponent";
import { NotificationQueueComponent } from "./customComponents/NotificationQueueComponent";
import createExtendedSendComponent from "./customComponents/SendComponent";

// todo: organize these alphabetically
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
export const DoubleCounter = createExtendedNumberComponent(world, {
  id: "DoubleCounter",
});
export const SelectedTile = createExtendedCoordComponent(world, { id: "SelectedTile" });
export const HoverTile = createExtendedCoordComponent(world, { id: "HoverTile" });
export const SelectedBuilding = createExtendedComponent(world, { value: Type.Entity }, { id: "SelectedBuilding" });
export const SelectedAction = createExtendedNumberComponent(world, {
  id: "SelectedAction",
});

export const Marker = createExtendedMarkerComponent(world, {
  id: "MarkerTypeComponent",
});

export const ActiveAsteroid = createExtendedComponent(world, { value: Type.Entity }, { id: "ActiveAsteroid" });

export const Send = createExtendedSendComponent(world);

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

export const Battle = BattleComponent();

export const NotificationQueue = NotificationQueueComponent();

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

const DevHighlight = createExtendedComponent(world, { value: Type.OptionalNumber }, { id: "DevHighlight" });
export default {
  Account,
  HomeAsteroid,
  Battle,
  BattleReport,
  DevHighlight,
};
