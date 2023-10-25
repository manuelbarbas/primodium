import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";
import { ObjectiveEnumLookup } from "src/util/constants";

export const claimObjective = async (rawObjective: Entity, network: SetupNetworkResult) => {
  const objective = ObjectiveEnumLookup[rawObjective];
  if (!objective) throw new Error(`Objective ${rawObjective} not found in ObjectiveEnumLookup`);
  const tx = await network.worldContract.write.claimObjective([objective]);
  await network.waitForTransaction(tx);
};
