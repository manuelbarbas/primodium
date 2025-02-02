import { Core } from "@primodiumxyz/core";
import { GlobalApi } from "@game/api/global";
import { modeSystem } from "@game/scenes/root/systems/modeSystem";
import { setupAudioEffects } from "@game/scenes/root/systems/setupAudioEffects";
import { PrimodiumScene } from "@game/types";

export const runSystems = (scene: PrimodiumScene, game: GlobalApi, core: Core) => {
  modeSystem(game, core);
  setupAudioEffects(scene, core);
};
