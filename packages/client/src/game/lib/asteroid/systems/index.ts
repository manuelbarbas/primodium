import { Scene } from "engine/types";
import { focusMainbase } from "./focusMainbase";
import { renderBuilding } from "./renderBuilding";
import { renderBuildingMoveTool } from "./renderBuildingMoveTool";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderFog } from "./renderFog";
import { renderHoverTile } from "./renderHoverTile";
import { renderQueuedBuildings } from "./renderQueuedBuildings";
// import { renderSelectedTile } from "./renderSelectedTile";

export const runSystems = (scene: Scene) => {
  //Render world entity's sprites
  renderBuilding(scene);

  // Render map utility elements, placement indicators, etc
  // renderSelectedTile(scene);
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene);
  renderBuildingMoveTool(scene);
  focusMainbase(scene);
  renderFog(scene);
  renderQueuedBuildings(scene);
};
