import { EntityID } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuilding } from "./renderBuilding";
import { renderHoverTile } from "./renderHoverTile";
import { renderSelectedTile } from "./renderSelectedTile";
import { focusMainbase } from "./focusMainbase";
import { renderFog } from "./renderFog";

export const runSystems = (scene: Scene, player: EntityID) => {
  //Render world entity's sprites
  renderBuilding(scene);

  // Render map utility elements, placement indicators, etc
  renderSelectedTile(scene);
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene);
  focusMainbase(scene, player);
  renderFog(scene, player);
};
