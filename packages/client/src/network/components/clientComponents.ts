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

// todo: organize these alphabetically
export const BlockNumber = newNumberComponent(world, {
  id: "BlockNumber",
});
export const Account = newEntityComponent(world, { id: "Account" });

export const GameReady = newBoolComponent(world, { id: "GameReady" });
export const DoubleCounter = newNumberComponent(world, {
  id: "DoubleCounter",
});
export const SelectedTile = newCoordComponent(world, { id: "SelectedTile" });
export const HoverTile = newCoordComponent(world, { id: "HoverTile" });
export const SelectedBuilding = newComponent(
  world,
  { value: Type.Entity },
  { id: "SelectedBuilding" }
);
export const SelectedAction = newNumberComponent(world, {
  id: "SelectedAction",
});

export const Marker = newMarkerComponent(world, {
  id: "MarkerTypeComponent",
});

export const ActiveAsteroid = newComponent(
  world,
  { value: Type.Entity },
  { id: "ActiveAsteroid" }
);

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

export const Battle = BattleComponent();

export default {
  ActiveAsteroid,
  BlockNumber,
  GameReady,
  DoubleCounter,
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
  Marker,
  TrainingQueue,
  Hangar,
  Leaderboard,
  Send,
  Battle,
};
