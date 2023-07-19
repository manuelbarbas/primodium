import { Type } from "@latticexyz/recs";
import Component, {
  BoolComponent,
  CoordComponent,
  NumberComponent,
} from "../Component";
import { world } from "../world";
import MarkerTypeComponent from "./customComponents/MarkerComponent";
import SelectedAttackComponent from "./customComponents/SelectedAttackComponent";

const components = {
  BlockNumber: new NumberComponent(world, { id: "BlockNumber" }),
  GameReady: new BoolComponent(world, { id: "GameReady" }),
  DoubleCounter: new NumberComponent(world, { id: "DoubleCounter" }),
  SelectedTile: new CoordComponent(world, { id: "SelectedTile" }),
  HoverTile: new CoordComponent(world, { id: "HoverTile" }),
  SelectedBuilding: new Component(
    world,
    { value: Type.Entity },
    { id: "SelectedBuilding" }
  ),
  SelectedAction: new NumberComponent(world, { id: "SelectedAction" }),
  StartSelectedPath: new CoordComponent(world, { id: "StartSelectedPath" }),
  SelectedAttack: new SelectedAttackComponent(world, { id: "SelectedAttack" }),
  Marker: new MarkerTypeComponent(world, { id: "MarkerTypeComponent" }),
};

export default components;
