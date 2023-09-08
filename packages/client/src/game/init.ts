import { Network } from "src/network/layer";

import { initAsteroidView } from "./lib/asteroid/init";
import { initBeltView } from "./lib/belt/init";

async function init(network: Network) {
  await initAsteroidView(network);
  await initBeltView(network);
}

export default init;
