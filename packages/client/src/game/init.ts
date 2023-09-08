import { EntityID } from "@latticexyz/recs";
import { Network } from "src/network/setupNetworkOld";

import { initAsteroidView } from "./lib/asteroid/init";
import { initBeltView } from "./lib/belt/init";

async function init(player: EntityID, network: Network) {
  await initAsteroidView(player, network);
  await initBeltView(player, network);
}

export default init;
