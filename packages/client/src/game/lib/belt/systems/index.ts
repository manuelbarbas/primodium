import { Scene } from "engine/types";
import { renderTrajectory } from "./renderTrajectory";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";

export const runSystems = (scene: Scene) => {
  renderTrajectory(scene);
  renderAsteroid(scene);
  focusAsteroid(scene);

  renderMotherlode(scene);
};
