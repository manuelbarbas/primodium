import { Scene } from "engine/types";
// import { focusAsteroid } from "./focusAsteroid";
import { renderAsteroid } from "./renderAsteroid";
import { renderEffects } from "./renderEffects";
import { renderMoveLine } from "./renderMoveLine";
import { renderPirateAsteroid } from "./renderPirateAsteroid";

export const runSystems = (scene: Scene) => {
  // focusAsteroid(scene, mud);

  renderAsteroid(scene);
  renderPirateAsteroid(scene);
  renderMoveLine(scene);

  // renderArrivalsInTransit(scene);
  // renderArrivalsInOrbit(scene);

  renderEffects(scene);
};
