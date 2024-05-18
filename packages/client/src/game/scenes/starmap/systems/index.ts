import { renderAsteroids } from "@/game/scenes/starmap/systems/renderAsteroids";
import { renderBattle } from "@/game/scenes/starmap/systems/renderBattle";
import { renderFleets } from "@/game/scenes/starmap/systems/renderFleets";
import { renderShardAsteroids } from "@/game/scenes/starmap/systems/renderShardAsteroids";
import { renderTrajectory } from "@/game/scenes/starmap/systems/renderTrajectory";
import { PrimodiumScene } from "@/game/api/scene";

export const runSystems = (scene: PrimodiumScene) => {
  renderAsteroids(scene);
  renderShardAsteroids(scene);
  renderFleets(scene);
  renderBattle(scene);
  renderTrajectory(scene);
};
