import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";

export const train = async (
  buildingEntity: EntityID,
  type: EntityID,
  count: number,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);
  await execute(
    systems["system.TrainUnits"].executeTyped(buildingEntity, type, count, {
      gasLimit: 28_000_000,
    }),
    providers
  );
  setTransactionLoading(false);
};
