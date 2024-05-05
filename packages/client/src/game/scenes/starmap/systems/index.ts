import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { renderBattle } from "./renderBattle";
import { renderFleets } from "./renderFleets";
import { renderShardAsteroid } from "./renderShardAsteroid";

export const runSystems = (scene: Scene) => {
  renderAsteroid(scene);
  renderShardAsteroid(scene);
  renderFleets(scene);
  renderBattle(scene);
};
