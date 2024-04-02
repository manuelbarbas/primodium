import { Scene } from "engine/types";
import { MUD } from "src/network/types";
import { renderAsteroid } from "./renderAsteroid";
import { renderAttackLine } from "./renderAttackLine";
import { renderBattle } from "./renderBattle";
import { renderFleets } from "./renderFleets";
import { renderMoveLine } from "./renderMoveLine";

export const runSystems = (scene: Scene, mud: MUD) => {
  renderAsteroid(scene);
  renderMoveLine(scene, mud);
  renderAttackLine(scene, mud);
  renderFleets(scene);
  renderBattle(scene);
};
