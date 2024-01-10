import { Scene } from "engine/types";
// import { focusAsteroid } from "./focusAsteroid";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { renderAsteroid } from "./renderAsteroid";
import { renderEffects } from "./renderEffects";
import { renderPirateAsteroid } from "./renderPirateAsteroid";

export const runSystems = (scene: Scene) => {
  // focusAsteroid(scene, mud);

  renderAsteroid(scene);
  renderPirateAsteroid(scene);

  renderArrivalsInTransit(scene);
  renderArrivalsInOrbit(scene);

  renderEffects(scene);
};
