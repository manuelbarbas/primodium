import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export const reinforce = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.reinforce([rockEntity as Hex, arrivalEntity as Hex]);
  await network.waitForTransaction(tx);
};
