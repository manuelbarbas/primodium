import engine from "engine";
import { MUD } from "src/network/types";
import gameConfig from "./config/game";
import { Scenes } from "./constants";
import { initAsteroidScene } from "./lib/asteroid/init";
import { setupAudioEffects } from "./lib/common/setup/setupAudioEffects";
import { initStarmapScene } from "./lib/starmap/init";

async function init(mud: MUD) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, mud);
  await initStarmapScene(game);

  setupAudioEffects(game.sceneManager.scenes.get(Scenes.Asteroid)!);
}

export default init;
