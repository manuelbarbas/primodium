import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
// import { renderUnitSend } from "./renderUnitSend";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
// import { renderPirateAsteroid } from "./renderPirateAsteroid";
import { SetupResult } from "src/network/types";

export const runSystems = (scene: Scene, mud: SetupResult) => {
  focusAsteroid(scene, mud);

  renderAsteroid(scene, mud);
  renderMotherlode(scene, mud);
  // renderPirateAsteroid(scene, player);

  renderArrivalsInTransit(scene, mud);
  renderArrivalsInOrbit(scene, mud);
};
