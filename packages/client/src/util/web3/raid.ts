import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";

export const raid = async (rockEntity: EntityID, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;

  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.Raid"].executeTyped(rockEntity, {
      gasLimit: 4_000_000,
    }),
    providers
  );

  ampli.systemRaid({
    asteroidCoord: rockEntity,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
