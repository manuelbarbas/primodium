import { MUD } from "@primodiumxyz/core/network/types";

import { PrimodiumScene } from "@/api/scene";
import { renderWormholeAnimations } from "@/scenes/asteroid/systems/renderWormholeAnimations";
import { focusMainbase } from "@/scenes/asteroid/systems/focusMainbase";
import { renderBuilding } from "@/scenes/asteroid/systems/renderBuilding";
import { renderBuildingMoveTool } from "@/scenes/asteroid/systems/renderBuildingMoveTool";
import { renderBuildingPlacementTool } from "@/scenes/asteroid/systems/renderBuildingPlacementTool";
import { renderAsteroidMap } from "@/scenes/asteroid/systems/renderAsteroidMap";
import { renderHoverTile } from "@/scenes/asteroid/systems/renderHoverTile";
import { renderQueuedBuildings } from "@/scenes/asteroid/systems/renderQueuedBuildings";

export const runSystems = (scene: PrimodiumScene, mud: MUD) => {
  // Render world entity's sprites
  renderAsteroidMap(scene);
  renderBuilding(scene);
  renderWormholeAnimations(scene);

  // Render map utility elements, placement indicators, etc
  renderHoverTile(scene);
  renderBuildingPlacementTool(scene, mud);
  renderBuildingMoveTool(scene, mud);
  focusMainbase(scene);
  renderQueuedBuildings(scene);
};
