import { Scene } from "engine/types";
import { renderBuildingPaths } from "./renderBuildingPaths";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuildingSprite } from "./renderBuildingSprite";
import { renderHoverTile } from "./renderHoverTile";
import { renderPathPlacementTool } from "./renderPathPlacementTool";
import { renderSelectedTile } from "./renderSelectedTile";

export const runSystems = (scene: Scene) => {
  //Render world entity's sprites and paths
  renderBuildingSprite(scene);
  renderBuildingPaths(scene);

  // Render map utility elements, placement indicators, etc
  renderSelectedTile(scene);
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene);
  renderPathPlacementTool(scene);
};
