import { Scene } from "engine/types";
import { renderAsteroid } from "./renderAsteroid";
import { focusAsteroid } from "./focusAsteroid";
import { renderMotherlode } from "./renderMotherlode";
import { renderUnitSend } from "./renderUnitSend";
import { renderArrivalsInTransit } from "./renderArrivalsInTransit";
import { EntityID } from "@latticexyz/recs";

export const runSystems = (scene: Scene, player: EntityID) => {
  renderUnitSend(scene);
  renderAsteroid(scene);
  focusAsteroid(scene);
  renderArrivalsInTransit(scene, player);

  renderMotherlode(scene);
};
