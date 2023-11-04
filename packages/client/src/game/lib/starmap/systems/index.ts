import { Scene } from "engine/types";
import { focusAsteroid } from "./focusAsteroid";
import { renderAsteroid } from "./renderAsteroid";
import { renderMotherlode } from "./renderMotherlode";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { SetupResult } from "src/network/types";
import { renderPirateAsteroid } from "./renderPirateAsteroid";
import { renderEffects } from "./renderEffects";

export const runSystems = (scene: Scene, mud: SetupResult) => {
  focusAsteroid(scene, mud);

  renderAsteroid(scene, mud);
  renderMotherlode(scene, mud);
  renderPirateAsteroid(scene, mud.network.playerEntity);

  renderArrivalsInTransit(scene, mud);
  renderArrivalsInOrbit(scene, mud);

  renderEffects(scene, mud);
};
