import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";

export const recall = async (rockEntity: EntityID, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.RecallReinforcements"].executeTyped(rockEntity, {
      gasLimit: 4_000_000,
    }),
    providers
  );

  ampli.systemRecallReinforcements({
    asteroidCoord: rockEntity,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};

export const recallUnitsFromMotherlode = async (
  rockEntity: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.RecallUnitsFromMotherlode"].executeTyped(rockEntity, {
      gasLimit: 4_000_000,
    }),
    providers
  );

  ampli.systemRecallReinforcements({
    asteroidCoord: rockEntity,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
