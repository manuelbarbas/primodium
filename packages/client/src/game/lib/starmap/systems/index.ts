import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
// import { renderUnitSend } from "./renderUnitSend";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { Account } from "src/network/components/clientComponents";
import { renderPirateAsteroid } from "./renderPirateAsteroid";

export const runSystems = (scene: Scene) => {
  const player = Account.get()?.value!;

  focusAsteroid(scene);

  renderAsteroid(scene, player);
  renderMotherlode(scene, player);
  renderPirateAsteroid(scene, player);

  renderArrivalsInTransit(scene, player);
  renderArrivalsInOrbit(scene, player);
};
