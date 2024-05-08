import { GameApi } from "@/game/api/game";
import { modeSystem } from "@/game/scenes/root/systems/modeSystem";
import { SceneApi } from "@/game/api/scene";
import { mapOpenFx } from "./mapOpenFx";

export const runSystems = (scene: SceneApi, game: GameApi) => {
  mapOpenFx(scene);
  modeSystem(game);
};
