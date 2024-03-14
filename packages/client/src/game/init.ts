import engine from "engine";
import gameConfig from "./config/game";
import { Scenes } from "./constants";
import { initAsteroidScene } from "./scenes/asteroid/init";
import { setupAudioEffects } from "./scenes/common/setup/setupAudioEffects";
import { initStarmapScene } from "./scenes/starmap/init";
import { initUIScene } from "./scenes/ui/init";

async function init() {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game);
  await initStarmapScene(game);
  await initUIScene(game);

  setupAudioEffects(game.sceneManager.scenes.get(Scenes.Asteroid)!);
}

export default init;
