import engine from "engine";
import gameConfig from "@game/lib/config/game";
import { initAsteroidScene } from "@game/scenes/asteroid/init";
import { initStarmapScene } from "@game/scenes/starmap/init";
import { initUIScene } from "@game/scenes/ui/init";
import { initRootScene } from "@game/scenes/root/init";
import { initCommandCenter } from "@/game/scenes/command-center/init";

async function init() {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game);
  await initStarmapScene(game);
  await initUIScene(game);
  await initRootScene(game);
  await initCommandCenter(game);
}

export default init;
