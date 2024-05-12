import { createGlobalApi, GlobalApi } from "@/game/api/global";
import { PrimodiumScene } from "@/game/api/scene";
import { SceneKeys } from "@/game/lib/constants/common";
import { initCommandCenter } from "@/game/scenes/command-center/init";
import gameConfig from "@game/lib/config/game";
import { initAsteroidScene } from "@game/scenes/asteroid/init";
import { initRootScene } from "@game/scenes/root/init";
import { initStarmapScene } from "@game/scenes/starmap/init";
import { initUIScene } from "@game/scenes/ui/init";

import engine from "engine";

async function init(): Promise<Record<SceneKeys, PrimodiumScene> & { GLOBAL: GlobalApi }> {
  const game = await engine.createGame(gameConfig);
  const globalApi = createGlobalApi(game);

  return {
    ROOT: await initRootScene(globalApi),
    UI: await initUIScene(globalApi),
    ASTEROID: await initAsteroidScene(globalApi),
    STARMAP: await initStarmapScene(globalApi),
    COMMAND_CENTER: await initCommandCenter(globalApi),
    GLOBAL: globalApi,
  };
}

export default init;
