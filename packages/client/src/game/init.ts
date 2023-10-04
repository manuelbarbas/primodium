import engine from "engine";
import { initAsteroidScene } from "./lib/asteroid/init";
import gameConfig from "./config/game";
// import { initStarmapScene } from "./lib/starmap/init";
import { SetupResult } from "src/network/types";

async function init(mud: SetupResult) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, mud);
  // await initStarmapScene(game, mud);
}

export default init;
