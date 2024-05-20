import { GlobalApi } from "@/game/api/global";
import { modeSystem } from "@/game/scenes/root/systems/modeSystem";
import { PrimodiumScene } from "@/game/api/scene";
import { mapOpenFx } from "@/game/scenes/root/systems/mapOpenFx";
import { setupAudioEffects } from "@/game/scenes/root/systems/setupAudioEffects";

export const runSystems = (scene: PrimodiumScene, game: GlobalApi) => {
  mapOpenFx(scene);
  modeSystem(game);
  setupAudioEffects(scene);
};
