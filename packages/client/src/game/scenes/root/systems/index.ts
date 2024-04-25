import { Game, Scene } from "engine/types";
import { mapOpenFx } from "./mapOpenFx";
import { modeSystem } from "@/game/scenes/root/systems/modeSystem";

export const runSystems = (scene: Scene, game: Game) => {
  mapOpenFx(scene);
  modeSystem(game);
};
