import { Network } from "src/network/setupNetworkOld";

async function init(network: Network) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, network);
  await initStarmapScene(game, network);
}

export default init;
