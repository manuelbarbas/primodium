import { EntityID } from "@latticexyz/recs";
import { Network } from "src/network/layer";

import { initAsteroidView } from "./lib/asteroid/init";
import { initBeltView } from "./lib/belt/init";

async function init(player: EntityID, network: Network) {
  await initAsteroidView(network);
  await initBeltView(player, network);
}

export default init;
