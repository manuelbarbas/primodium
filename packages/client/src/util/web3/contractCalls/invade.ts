import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export const invade = async (rockEntity: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.invade([rockEntity as Hex]);
  await network.waitForTransaction(tx);
};
