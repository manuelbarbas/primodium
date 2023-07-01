import { Scene } from "src/engine/types";
import { Network } from "src/network/layer";
import { renderBuildingPlacementTool } from "./renderBuildingPlacementTool";
import { renderEntitySprites } from "./renderEntitySprites";
import { renderEntityPaths } from "./renderEntityPaths";
import { renderSelectionTile } from "./renderSelectionTile";
import { renderDemolishBuildingTool } from "./renderDemolishBuildingTool";
import { renderDemolishPathTool } from "./renderDemolishPathTool";
import { renderPathPlacementTool } from "./renderPathPlacementTool";
import { renderAttackTargetingTool } from "./renderAttackTargetingTool";

export const runSystems = (scene: Scene, network: Network) => {
  //Render world entity's sprites and paths
  renderEntitySprites(scene, network);
  renderEntityPaths(scene, network);

  // Render map utility elements, placement indicators, etc
  renderSelectionTile(scene, network);
  renderBuildingPlacementTool(scene, network);
  renderPathPlacementTool(scene, network);
  renderAttackTargetingTool(scene, network);
  renderDemolishBuildingTool(scene, network);
  renderDemolishPathTool(scene, network);
};
