import { Scene } from "engine/types";
import { MUD } from "src/network/types";
import { focusAsteroid } from "./focusAsteroid";
import { renderAsteroid } from "./renderAsteroid";
import { renderAttackLine } from "./renderAttackLine";
import { renderBattle } from "./renderBattle";
import { renderFleets } from "./renderFleetsInOrbit";
import { renderMoveLine } from "./renderMoveLine";
import { renderPirateAsteroid } from "./renderPirateAsteroid";

export const runSystems = (scene: Scene, mud: MUD) => {
  focusAsteroid(scene);
  renderAsteroid(scene);
  renderPirateAsteroid(scene);
  renderMoveLine(scene, mud);
  renderAttackLine(scene, mud);
  renderFleets(scene);
  renderBattle(scene);
};
