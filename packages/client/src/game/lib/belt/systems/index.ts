import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
import { renderUnitSend } from "./renderUnitSend";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { EntityID } from "@latticexyz/recs";
import { renderArrivalsInOrbit } from "./renderArrivalsInOrbit";

export const runSystems = (scene: Scene, player: EntityID) => {
  focusAsteroid(scene);

  renderUnitSend(scene);

  renderAsteroid(scene, player);
  renderMotherlode(scene, player);

  renderArrivalsInTransit(scene, player);
  renderArrivalsInOrbit(scene, player);
};
