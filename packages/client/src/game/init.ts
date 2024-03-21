import engine from "engine";
import gameConfig from "./lib/config/game";
import { initAsteroidScene } from "./scenes/asteroid/init";
import { setupAudioEffects } from "./scenes/common/setup/setupAudioEffects";
import { initStarmapScene } from "./scenes/starmap/init";
import { initUIScene } from "./scenes/ui/init";
import { Scenes } from "./lib/constants/common";

async function init() {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game);
  await initStarmapScene(game);
  await initUIScene(game);

  setupAudioEffects(game.sceneManager.scenes.get(Scenes.UI)!);
}

export default init;
