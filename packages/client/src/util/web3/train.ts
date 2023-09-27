import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";

export const train = async (
  buildingEntity: EntityID,
  type: EntityID,
  count: number,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);
  const receipt = await execute(
    systems["system.TrainUnits"].executeTyped(buildingEntity, type, count, {
      gasLimit: 28_000_000,
    }),
    providers
  );

  ampli.systemTrainUnits({
    buildingName: BlockIdToKey[buildingEntity],
    unitName: BlockIdToKey[type],
    unitCount: count,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
