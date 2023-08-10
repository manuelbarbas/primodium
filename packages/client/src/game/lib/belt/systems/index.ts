import { Scene } from "engine/types";
import { renderTrajectory } from "./renderTrajectory";
import { renderAsteroid } from "./renderAsteroid";

export const runSystems = (scene: Scene) => {
  renderTrajectory(scene);
  renderAsteroid(scene);
};
