import { EntityID } from "@latticexyz/recs";
import { Network } from "src/network/layer";

import { initAsteroidMap } from "./lib/asteroid/scripts/initAsteroidMap";
import { initBeltMap } from "./lib/belt/scripts/initBeltMap";

async function init(player: EntityID, network: Network) {
  await initAsteroidMap(player, network);
  await initBeltMap(player, network);
}

export default init;
