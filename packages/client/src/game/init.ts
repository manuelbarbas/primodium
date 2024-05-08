import { createGameApi, GameApi } from "@/game/api/game";
import { SceneApi } from "@/game/api/scene";
import { SceneKeys } from "@/game/lib/constants/common";
import { initCommandCenter } from "@/game/scenes/command-center/init";
import gameConfig from "@game/lib/config/game";
import { initAsteroidScene } from "@game/scenes/asteroid/init";
import { initRootScene } from "@game/scenes/root/init";
import { initStarmapScene } from "@game/scenes/starmap/init";
import { initUIScene } from "@game/scenes/ui/init";

import engine from "engine";

async function init(): Promise<Record<SceneKeys, SceneApi> & { GAME: GameApi }> {
  const game = await engine.createGame(gameConfig);
  const gameApi = createGameApi(game);

  // batch these awaits

  const asteroidApiPromise = initAsteroidScene(gameApi);
  const starmapApiPromise = initStarmapScene(gameApi);
  const uiApiPromise = initUIScene(gameApi);
  const rootApiPromise = initRootScene(gameApi);
  const commandCenterApiPromise = initCommandCenter(gameApi);

  const [asteroidApi, starmapApi, uiApi, rootApi, commandCenterApi] = await Promise.all([
    asteroidApiPromise,
    starmapApiPromise,
    uiApiPromise,
    rootApiPromise,
    commandCenterApiPromise,
  ]);

  return {
    ASTEROID: asteroidApi,
    STARMAP: starmapApi,
    UI: uiApi,
    ROOT: rootApi,
    COMMAND_CENTER: commandCenterApi,
    GAME: gameApi,
  };
}

export default init;
