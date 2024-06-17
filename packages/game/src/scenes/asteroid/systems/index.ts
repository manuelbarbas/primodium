import { Core } from "@primodiumxyz/core";

import { PrimodiumScene } from "@game/types";
import { renderWormholeAnimations } from "@game/scenes/asteroid/systems/renderWormholeAnimations";
import { focusMainbase } from "@game/scenes/asteroid/systems/focusMainbase";
import { renderBuilding } from "@game/scenes/asteroid/systems/renderBuilding";
import { renderBuildingMoveTool } from "@game/scenes/asteroid/systems/renderBuildingMoveTool";
import { renderBuildingPlacementTool } from "@game/scenes/asteroid/systems/renderBuildingPlacementTool";
import { renderAsteroidMap } from "@game/scenes/asteroid/systems/renderAsteroidMap";
import { renderHoverTile } from "@game/scenes/asteroid/systems/renderHoverTile";
import { renderQueuedBuildings } from "@game/scenes/asteroid/systems/renderQueuedBuildings";

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
