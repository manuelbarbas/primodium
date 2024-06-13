import { engine } from "@primodiumxyz/engine";
import { Core } from "@primodiumxyz/core";

import { createGlobalApi, GlobalApi } from "@/api/global";
import { PrimodiumScene } from "@/api/scene";
import { SceneKeys } from "@/lib/constants/common";
import { initCommandCenter } from "@/scenes/command-center/init";
import gameConfig from "@/lib/config/game";
import { initAsteroidScene } from "@/scenes/asteroid/init";
import { initRootScene } from "@/scenes/root/init";
import { initStarmapScene } from "@/scenes/starmap/init";
import { initUIScene } from "@/scenes/ui/init";

export type InitResult = Promise<Record<SceneKeys, PrimodiumScene> & { GLOBAL: GlobalApi }>;
async function init(core: Core): InitResult {
  const game = await engine.createGame(gameConfig);
  const globalApi = createGlobalApi(game);

  return {
    // primary scenes
    // run straight away when the Game component is mounted, meaning right after initial queries were fetched,
    // which is strictly data required to render the home asteroid
    ROOT: await initRootScene(globalApi),
    UI: await initUIScene(globalApi),
    ASTEROID: await initAsteroidScene(globalApi, core),
    GLOBAL: globalApi,
    // secondary scenes
    // run after secondary queries were fetched, which is the data required to render the asteroids, fleets and other players;
    // this helps preparing the home asteroid as fast as possible, and making sure global systems are run afterwards over complete data
    STARMAP: await initStarmapScene(globalApi),
    COMMAND_CENTER: await initCommandCenter(globalApi, core),
  };
}

export default init;
