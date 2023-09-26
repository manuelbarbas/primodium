import { Type } from "@latticexyz/recs";
import { world } from "../world";
import newComponent, {
  newBoolComponent,
  newCoordComponent,
  newEntityComponent,
  newNumberComponent,
} from "./customComponents/Component";
import newMarkerComponent from "./customComponents/MarkerComponent";
import newSendComponent from "./customComponents/SendComponent";
import { BattleComponent } from "./customComponents/BattleComponent";
import { NotificationQueueComponent } from "./customComponents/NotificationQueueComponent";

export const Account = newEntityComponent(world, { id: "Account" });

export const HomeAsteroid = newComponent(
  world,
  { value: Type.Entity },
  { id: "HomeAsteroid" }
);

export const Battle = BattleComponent();

export const BattleReport = newComponent(
  world,
  {
    show: Type.Boolean,
    battle: Type.OptionalEntity,
  },
  {
    id: "Battle",
  }
);

export const BlockNumber = newComponent(
  world,
  {
    value: Type.Number,
    avgBlockTime: Type.Number, //seconds
  },
  {
    id: "BlockNumber",
  }
);

export const DoubleCounter = newNumberComponent(world, {
  id: "DoubleCounter",
});

export const GameReady = newBoolComponent(world, { id: "GameReady" });

export const Hangar = newComponent(
  world,
  {
    units: Type.EntityArray,
    counts: Type.NumberArray,
  },
  {
    id: "Hangar",
  }
);

export const HoverTile = newCoordComponent(world, { id: "HoverTile" });

export const Leaderboard = newComponent(
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

export const MapOpen = newBoolComponent(world, {
  id: "MapOpen",
});

export const Marker = newMarkerComponent(world, {
  id: "MarkerTypeComponent",
});

export const NotificationQueue = NotificationQueueComponent();

export const SelectedAction = newNumberComponent(world, {
  id: "SelectedAction",
});

export const SelectedBuilding = newComponent(
  world,
  { value: Type.Entity },
  { id: "SelectedBuilding" }
);

export const SelectedTile = newCoordComponent(world, { id: "SelectedTile" });

export const Send = newSendComponent(world);

export const TrainingQueue = newComponent(
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

export default {
  Account,
  ActiveAsteroid: HomeAsteroid,
  Battle,
  BattleReport,
  BlockNumber,
  DoubleCounter,
  GameReady,
  Hangar,
  HoverTile,
  Leaderboard,
  MapOpen,
  Marker,
  NotificationQueue,
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
  Send,
  TrainingQueue,
};
