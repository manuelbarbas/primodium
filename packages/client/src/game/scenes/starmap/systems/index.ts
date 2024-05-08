import { SceneApi } from "@/game/api/scene";
import { MUD } from "src/network/types";
import { renderAsteroid } from "./renderAsteroid";
import { renderAttackLine } from "./renderAttackLine";
import { renderBattle } from "./renderBattle";
import { renderFleets } from "./renderFleets";
import { renderMoveLine } from "./renderMoveLine";
import { renderShardAsteroid } from "./renderShardAsteroid";

export const runSystems = (scene: SceneApi, mud: MUD) => {
  renderAsteroid(scene);
  renderShardAsteroid(scene);
  renderMoveLine(scene, mud);
  renderAttackLine(scene, mud);
  renderFleets(scene);
  renderBattle(scene);
};
