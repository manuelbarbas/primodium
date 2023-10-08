import { Scene } from "engine/types";
import { focusAsteroid } from "./focusAsteroid";
import { renderAsteroid } from "./renderAsteroid";
import { renderMotherlode } from "./renderMotherlode";
// import { renderUnitSend } from "./renderUnitSend";
import { Account } from "src/network/components/clientComponents";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
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
