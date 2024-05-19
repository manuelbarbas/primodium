import { GlobalApi } from "@/game/api/global";
import { modeSystem } from "@/game/scenes/root/systems/modeSystem";
import { PrimodiumScene } from "@/game/api/scene";
import { setupAudioEffects } from "@/game/scenes/root/systems/setupAudioEffects";

export const runSystems = (scene: PrimodiumScene, game: GlobalApi) => {
  modeSystem(game);
  setupAudioEffects(scene);
};
