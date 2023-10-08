import { Entity } from "@latticexyz/recs";
import { BytesLike } from "ethers";
import { SetupNetworkResult } from "src/network/types";

export const debugComponentDevSystem = async (
  componentId: Entity,
  entity: Entity,
  value: BytesLike | undefined,
  network: SetupNetworkResult
) => {
  // const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  // const tx = await network.worldContract.write.claimObjective([objective]);
  // await network.waitForTransaction(tx);
  // setTransactionLoading(true);
  // await execute(
  //   systems["system.ComponentDev"].executeTyped(componentId, entity, value, {
  //     gasLimit: 1_000_000,
  //   }),
  //   providers
  // );
  // setTransactionLoading(false);
};
