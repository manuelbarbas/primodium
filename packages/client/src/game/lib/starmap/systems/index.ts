import { Scene } from "engine/types";
import { SetupResult } from "src/network/types";
// import { focusAsteroid } from "./focusAsteroid";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { renderAsteroid } from "./renderAsteroid";
import { renderEffects } from "./renderEffects";
import { renderMotherlode } from "./renderMotherlode";
import { renderPirateAsteroid } from "./renderPirateAsteroid";

export const runSystems = (scene: Scene, mud: SetupResult) => {
  // focusAsteroid(scene, mud);

  renderAsteroid(scene, mud);
  renderMotherlode(scene, mud);
  renderPirateAsteroid(scene, mud.network.playerEntity);

  renderArrivalsInTransit(scene, mud);
  renderArrivalsInOrbit(scene, mud);

  renderEffects(scene, mud);
};
