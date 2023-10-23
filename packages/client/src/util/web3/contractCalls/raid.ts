import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export const raid = async (rockEntity: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.raid([rockEntity as Hex]);
  await network.waitForTransaction(tx);
};
