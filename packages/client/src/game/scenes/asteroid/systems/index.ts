import { MUD } from "src/network/types";
import { focusMainbase } from "./focusMainbase";
import { renderBuilding } from "./renderBuilding";
import { renderBuildingMoveTool } from "./renderBuildingMoveTool";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderAsteroidMap } from "./renderAsteroidMap";
import { renderHoverTile } from "./renderHoverTile";
import { renderQueuedBuildings } from "./renderQueuedBuildings";
import { PrimodiumScene } from "@/game/api/scene";

export const runSystems = (scene: PrimodiumScene, mud: MUD) => {
  // Render world entity's sprites
  renderAsteroidMap(scene);
  renderBuilding(scene);

  // Render map utility elements, placement indicators, etc
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene, mud);
  renderBuildingMoveTool(scene, mud);
  focusMainbase(scene);
  renderQueuedBuildings(scene);
};
