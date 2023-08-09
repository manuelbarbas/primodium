import { Type } from "@latticexyz/recs";
import { world } from "../world";
import newComponent, {
  newBoolComponent,
  newCoordComponent,
  newNumberComponent,
} from "./customComponents/Component";
import newMarkerComponent from "./customComponents/MarkerComponent";

export const BlockNumber = newNumberComponent(world, {
  id: "BlockNumber",
});
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
export const StartSelectedPath = newCoordComponent(world, {
  id: "StartSelectedPath",
});

export const Marker = newMarkerComponent(world, {
  id: "MarkerTypeComponent",
});

export default {
  BlockNumber,
  GameReady,
  DoubleCounter,
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
  StartSelectedPath,
  Marker,
};
