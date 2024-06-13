import { Core } from "@primodiumxyz/core";
import { renderAsteroids } from "@/scenes/starmap/systems/renderAsteroids";
import { renderFleets } from "@/scenes/starmap/systems/renderFleets";
import { renderShardAsteroids } from "@/scenes/starmap/systems/renderShardAsteroids";
import { renderTrajectory } from "@/scenes/starmap/systems/renderTrajectory";
import { PrimodiumScene } from "@/api/scene";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  renderAsteroids(scene, core);
  renderShardAsteroids(scene, core);
  renderFleets(scene, core);
  renderTrajectory(scene, core);
};
