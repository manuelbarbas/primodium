import { Core } from "@primodiumxyz/core";

import { PrimodiumScene } from "@/api/scene";
import { renderWormholeAnimations } from "@/scenes/asteroid/systems/renderWormholeAnimations";
import { focusMainbase } from "@/scenes/asteroid/systems/focusMainbase";
import { renderBuilding } from "@/scenes/asteroid/systems/renderBuilding";
import { renderBuildingMoveTool } from "@/scenes/asteroid/systems/renderBuildingMoveTool";
import { renderBuildingPlacementTool } from "@/scenes/asteroid/systems/renderBuildingPlacementTool";
import { renderAsteroidMap } from "@/scenes/asteroid/systems/renderAsteroidMap";
import { renderHoverTile } from "@/scenes/asteroid/systems/renderHoverTile";
import { renderQueuedBuildings } from "@/scenes/asteroid/systems/renderQueuedBuildings";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  // Render world entity's sprites
  renderAsteroidMap(scene, core);
  renderBuilding(scene, core);
  renderWormholeAnimations(scene, core);

  // Render map utility elements, placement indicators, etc
  renderHoverTile(scene, core);
  renderBuildingPlacementTool(scene, core);
  renderBuildingMoveTool(scene, core);
  focusMainbase(scene, core);
  renderQueuedBuildings(scene, core);
};
