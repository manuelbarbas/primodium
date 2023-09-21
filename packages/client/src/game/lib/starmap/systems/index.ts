import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
import { renderUnitSend } from "./renderUnitSend";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";
import { Account } from "src/network/components/clientComponents";

export const runSystems = (scene: Scene) => {
  const player = Account.get()?.value!;

  focusAsteroid(scene);

  // renderUnitSend(scene);

  renderAsteroid(scene, player);
  renderMotherlode(scene, player);

  // renderArrivalsInTransit(scene, player);
  // renderArrivalsInOrbit(scene, player);
};
