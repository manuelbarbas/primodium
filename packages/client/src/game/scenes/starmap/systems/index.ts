import { Scene } from "engine/types";
import { renderAsteroid } from "@/game/scenes/starmap/systems/renderAsteroid";
import { renderBattle } from "@/game/scenes/starmap/systems/renderBattle";
import { renderFleets } from "@/game/scenes/starmap/systems/renderFleets";
import { renderShardAsteroid } from "@/game/scenes/starmap/systems/renderShardAsteroid";
import { renderTrajectory } from "@/game/scenes/starmap/systems/renderTrajectory";

export const runSystems = (scene: Scene) => {
  renderAsteroid(scene);
  renderShardAsteroid(scene);
  renderFleets(scene);
  renderBattle(scene);
  renderTrajectory(scene);
};
