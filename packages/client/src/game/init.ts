import { Network } from "src/network/layer";
import { initAsteroidMap } from "./lib/scripts/initAsteroidMap";
import { EntityID } from "@latticexyz/recs";

async function init(player: EntityID, network: Network) {
  await initAsteroidMap(player, network);
}

export default init;
