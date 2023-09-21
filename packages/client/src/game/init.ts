import { Network } from "src/network/layer";
import engine from "engine";
import { initAsteroidScene } from "./lib/asteroid/init";
import gameConfig from "./config/game";
import { initStarmapScene } from "./lib/starmap/init";

async function init(network: Network) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, network);
  await initStarmapScene(game, network);
}

export default init;
