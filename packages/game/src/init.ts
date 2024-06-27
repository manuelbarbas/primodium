import { engine } from "@primodiumxyz/engine";
import { Core } from "@primodiumxyz/core";
import type { ContractCalls } from "@client/contractCalls/createContractCalls";

import { createGlobalApi, GlobalApi } from "@game/api/global";
import { PrimodiumScene } from "@game/types";
import { SceneKeys } from "@game/lib/constants/common";
import { initCommandCenter } from "@game/scenes/command-center/init";
import gameConfig from "@game/lib/config/game";
import { initAsteroidScene } from "@game/scenes/asteroid/init";
import { initRootScene } from "@game/scenes/root/init";
import { initStarmapScene } from "@game/scenes/starmap/init";
import { initUIScene } from "@game/scenes/ui/init";

export type InitResult = Promise<Record<SceneKeys, PrimodiumScene> & { GLOBAL: GlobalApi }>;
async function init(core: Core, calls: ContractCalls): InitResult {
  const game = await engine.createGame(gameConfig);
  const globalApi = createGlobalApi(game);

  return {
    // primary scenes
    // run straight away when the Game component is mounted, meaning right after initial queries were fetched,
    // which is strictly data required to render the home asteroid
    ROOT: await initRootScene(globalApi, core),
    UI: await initUIScene(globalApi, core),
    ASTEROID: await initAsteroidScene(globalApi, core, calls),
    GLOBAL: globalApi,
    // secondary scenes
    // run after secondary queries were fetched, which is the data required to render the asteroids, fleets and other players;
    // this helps preparing the home asteroid as fast as possible, and making sure global systems are run afterwards over complete data
    STARMAP: await initStarmapScene(globalApi, core),
    COMMAND_CENTER: await initCommandCenter(globalApi, core),
  };
}

export default init;
