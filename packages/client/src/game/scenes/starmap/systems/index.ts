import { renderAsteroids } from "@/game/scenes/starmap/systems/renderAsteroids";
import { renderBattle } from "@/game/scenes/starmap/systems/renderBattle";
import { renderFleets } from "@/game/scenes/starmap/systems/renderFleets";
import { renderShardAsteroids } from "@/game/scenes/starmap/systems/renderShardAsteroids";
import { renderTrajectory } from "@/game/scenes/starmap/systems/renderTrajectory";
import { SceneApi } from "@/game/api/scene";

export const runSystems = (scene: SceneApi) => {
  renderAsteroids(scene);
  renderShardAsteroids(scene);
  renderFleets(scene);
  renderBattle(scene);
  renderTrajectory(scene);
};
