import { Type } from "@latticexyz/recs";
import Component, {
  BoolComponent,
  CoordComponent,
  NumberComponent,
} from "./customComponents/Component";
import { world } from "../world";
import MarkerTypeComponent from "./customComponents/MarkerComponent";
import SelectedAttackComponent from "./customComponents/SelectedAttackComponent";

export const Position = new CoordComponent(world, {
  id: "Position",
  overridable: true,
});
export const BlockNumber = new NumberComponent(world, {
  id: "BlockNumber",
});
export const GameReady = new BoolComponent(world, { id: "GameReady" });
export const DoubleCounter = new NumberComponent(world, {
  id: "DoubleCounter",
});
export const SelectedTile = new CoordComponent(world, { id: "SelectedTile" });
export const HoverTile = new CoordComponent(world, { id: "HoverTile" });
export const SelectedBuilding = new Component(
  world,
  { value: Type.Entity },
  { id: "SelectedBuilding" }
);
export const SelectedAction = new NumberComponent(world, {
  id: "SelectedAction",
});
export const StartSelectedPath = new CoordComponent(world, {
  id: "StartSelectedPath",
});
export const SelectedAttack = new SelectedAttackComponent(world, {
  id: "SelectedAttack",
});
export const Marker = new MarkerTypeComponent(world, {
  id: "MarkerTypeComponent",
});

export default {
  Position,
  BlockNumber,
  GameReady,
  DoubleCounter,
  SelectedTile,
  HoverTile,
  SelectedBuilding,
  SelectedAction,
  StartSelectedPath,
  SelectedAttack,
  Marker,
};
