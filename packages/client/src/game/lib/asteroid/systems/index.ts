import { Scene } from "engine/types";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuilding } from "./renderBuilding";
import { renderHoverTile } from "./renderHoverTile";
import { renderSelectedTile } from "./renderSelectedTile";
import { focusMainbase } from "./focusMainbase";
import { renderFog } from "./renderFog";
import { SetupResult } from "src/network/types";
import { renderQueuedBuildings } from "./renderQueuedBuildings";

export const runSystems = (scene: Scene, mud: SetupResult) => {
  //Render world entity's sprites
  renderBuilding(scene, mud);

  // Render map utility elements, placement indicators, etc
  renderSelectedTile(scene);
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene, mud);
  focusMainbase(scene, mud);
  renderFog(scene, mud);
  renderQueuedBuildings(scene, mud);
};
