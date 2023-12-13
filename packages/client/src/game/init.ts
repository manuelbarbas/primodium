import engine from "engine";
import { initAsteroidScene } from "./lib/asteroid/init";
import gameConfig from "./config/game";
import { initStarmapScene } from "./lib/starmap/init";
import { SetupResult } from "src/network/types";
import { setupAudioEffects } from "./lib/common/setup/setupAudioEffects";
import { Scenes } from "./constants";

async function init(mud: SetupResult) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, mud);
  await initStarmapScene(game, mud);

  setupAudioEffects(game.sceneManager.scenes.get(Scenes.Asteroid)!);
}

export default init;
