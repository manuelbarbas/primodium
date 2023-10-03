import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";

export const claimObjective = async (objective: Entity, network: SetupNetworkResult) => {
  // const tx = await network.worldContract.write.claimObjective([objective]);
  // await network.waitForTransaction(tx);
  // ampli.systemClaimObjective({
  //   objectiveType: BlockIdToKey[objective],
  //   ...parseReceipt(receipt),
  // });
};
