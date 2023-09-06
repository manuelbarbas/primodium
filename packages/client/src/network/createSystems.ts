import { getComponentValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Components, SetupNetworkResult } from "./types";

export function createSystems({ worldContract, waitForTransaction }: SetupNetworkResult, { Counter }: Components) {
  const increment = async () => {
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  return {
    increment,
  };
}
