import { Scene } from "engine/types";
import { renderAsteroids } from "@/game/scenes/starmap/systems/renderAsteroids";
import { renderBattle } from "@/game/scenes/starmap/systems/renderBattle";
import { renderFleets } from "@/game/scenes/starmap/systems/renderFleets";
import { renderShardAsteroids } from "@/game/scenes/starmap/systems/renderShardAsteroids";

export const runSystems = (scene: Scene) => {
  renderAsteroids(scene);
  renderShardAsteroids(scene);
  renderFleets(scene);
  renderBattle(scene);
};
