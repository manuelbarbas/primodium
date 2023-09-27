import { EntityID } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";

export const claimObjective = async (objective: EntityID, network: Network) => {
  const { providers, systems } = network;

  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);

  const receipt = await execute(
    systems["system.ClaimObjective"].executeTyped(objective, {
      gasLimit: 15_000_000,
    }),
    providers
  );

  ampli.systemClaimObjective({
    objectiveType: BlockIdToKey[objective],
    ...parseReceipt(receipt),
  });
  setTransactionLoading(false);
};
