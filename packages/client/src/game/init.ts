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

  return {
    ASTEROID: await initAsteroidScene(gameApi),
    STARMAP: await initStarmapScene(gameApi),
    UI: await initUIScene(gameApi),
    ROOT: await initRootScene(gameApi),
    COMMAND_CENTER: await initCommandCenter(gameApi),
    GAME: gameApi,
  };
}

export default init;
