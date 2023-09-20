import { Network } from "src/network/layer";
import engine from "engine";
import { initAsteroidScene } from "./lib/asteroid/init";
import gameConfig from "./config/asteroid/game";
// import { initBeltView } from "./lib/belt/init";

async function init(network: Network) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, network);
  // await initBeltView(network);
}

export default init;
