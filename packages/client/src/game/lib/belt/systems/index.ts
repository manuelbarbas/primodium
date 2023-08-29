import { Scene } from "engine/types";
import { renderTrajectory } from "./renderTrajectory";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
import { renderUnitSend } from "./renderUnitSend";

export const runSystems = (scene: Scene) => {
  renderTrajectory(scene);
  renderUnitSend(scene);
  renderAsteroid(scene);
  focusAsteroid(scene);

  renderMotherlode(scene);
};
