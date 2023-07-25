import { Scene } from "engine/types";
import { Network } from "src/network/layer";
import { renderAttackTargetingTool } from "./renderAttackTargetingTool";
import { renderBuildngPaths } from "./renderBuildingPaths";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderBuildingSprite } from "./renderBuildingSprite";
import { renderDemolishBuildingTool } from "./renderDemolishBuildingTool";
import { renderDemolishPathTool } from "./renderDemolishPathTool";
import { renderHoverTile } from "./renderHoverTile";
import { renderMapMarkers } from "./renderMapMarkers";
import { renderPathPlacementTool } from "./renderPathPlacementTool";
import { renderSelectedTile } from "./renderSelectedTile";

export const runSystems = (scene: Scene, network: Network) => {
  //Render world entity's sprites and paths
  renderBuildingSprite(scene, network);
  renderBuildngPaths(scene, network);

  // Render map utility elements, placement indicators, etc
  renderSelectedTile(scene, network);
  renderHoverTile(scene, network);
  renderBuildingPlacementTool(scene, network);
  renderPathPlacementTool(scene, network);
  renderAttackTargetingTool(scene, network);
  renderDemolishBuildingTool(scene, network);
  renderDemolishPathTool(scene, network);
  renderMapMarkers(scene, network);
};
