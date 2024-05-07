import { GameApi } from "@/game/api/game";
import { modeSystem } from "@/game/scenes/root/systems/modeSystem";
import { Scene } from "engine/types";
import { mapOpenFx } from "./mapOpenFx";

export const runSystems = (scene: Scene, game: GameApi) => {
  mapOpenFx(scene);
  modeSystem(game);
};
