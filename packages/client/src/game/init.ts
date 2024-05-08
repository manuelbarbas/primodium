import { createGameApi, GameApi } from "@/game/api/game";
import { SceneApi } from "@/game/api/scene";
import { SceneKeys } from "@/game/lib/constants/common";
import { initCommandCenter } from "@/game/scenes/command-center/init";
import { MUD } from "@/network/types";
import gameConfig from "@game/lib/config/game";
import { initAsteroidScene } from "@game/scenes/asteroid/init";
import { initRootScene } from "@game/scenes/root/init";
import { initStarmapScene } from "@game/scenes/starmap/init";
import { initUIScene } from "@game/scenes/ui/init";

import engine from "engine";
import { runSystems as runAsteroidSystems } from "src/game/scenes/asteroid/systems";
import { runSystems as runRootSystems } from "src/game/scenes/root/systems";
import { runSystems as runStarmapSystems } from "src/game/scenes/starmap/systems";

type SceneSystemsApi = SceneApi & { runSystems?: (mud: MUD) => void };

async function init(): Promise<Record<SceneKeys, SceneSystemsApi> & { GAME: GameApi }> {
  const game = await engine.createGame(gameConfig);
  const gameApi = createGameApi(game);

  // batch these awaits

  const asteroidApiPromise = initAsteroidScene(game);
  const starmapApiPromise = initStarmapScene(game);
  const uiApiPromise = initUIScene(game);
  const rootApiPromise = initRootScene(game);
  const commandCenterApiPromise = initCommandCenter(game);

  const [asteroidApi, starmapApi, uiApi, rootApi, commandCenterApi] = await Promise.all([
    asteroidApiPromise,
    starmapApiPromise,
    uiApiPromise,
    rootApiPromise,
    commandCenterApiPromise,
  ]);

  return {
    ASTEROID: { ...asteroidApi.api, runSystems: (mud) => runAsteroidSystems(asteroidApi.scene, mud) },
    STARMAP: { ...starmapApi.api, runSystems: (mud) => runStarmapSystems(starmapApi.scene, mud) },
    UI: uiApi.api,
    ROOT: { ...rootApi.api, runSystems: () => runRootSystems(rootApi.scene, gameApi) },
    COMMAND_CENTER: commandCenterApi.api,
    GAME: gameApi,
  };
}

export default init;
