import { EntityID } from "@latticexyz/recs";
import { BytesLike } from "ethers";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";

export const debugComponentDevSystem = async (
  componentId: EntityID,
  entity: EntityID,
  value: BytesLike,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);
  await execute(
    systems["system.ComponentDev"].executeTyped(componentId, entity, value, {
      gasLimit: 1_000_000,
    }),
    providers
  );
  setTransactionLoading(false);
};
