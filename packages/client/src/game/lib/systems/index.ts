import { Scene } from "src/engine/types";
import { Network } from "src/network/layer";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuildingSprites } from "./renderBuildingSprites";
import { renderBuildngPaths } from "./renderBuildingPaths";
import { renderSelectionTile } from "./renderSelectionTile";
import { renderDemolishBuildingTool } from "./renderDemolishBuildingTool";
import { renderDemolishPathTool } from "./renderDemolishPathTool";
import { renderPathPlacementTool } from "./renderPathPlacementTool";
import { renderAttackTargetingTool } from "./renderAttackTargetingTool";
import { renderMapMarkers } from "./renderMapMarkers";

export const runSystems = (scene: Scene, network: Network) => {
  //Render world entity's sprites and paths
  renderBuildingSprites(scene, network);
  renderBuildngPaths(scene, network);

  // Render map utility elements, placement indicators, etc
  renderSelectionTile(scene, network);
  renderBuildingPlacementTool(scene, network);
  renderPathPlacementTool(scene, network);
  renderAttackTargetingTool(scene, network);
  renderDemolishBuildingTool(scene, network);
  renderDemolishPathTool(scene, network);
  renderMapMarkers(scene, network);
};
