import { GlobalApi } from "@/api/global";
import { modeSystem } from "@/scenes/root/systems/modeSystem";
import { PrimodiumScene } from "@/api/scene";
import { setupAudioEffects } from "@/scenes/root/systems/setupAudioEffects";

export const runSystems = (scene: PrimodiumScene, game: GlobalApi) => {
  modeSystem(game);
  setupAudioEffects(scene);
};
