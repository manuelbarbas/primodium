import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";

export const recall = async (rockEntity: Entity, network: SetupNetworkResult) => {
  //   const receipt = await execute(
  //     systems["system.RecallReinforcements"].executeTyped(rockEntity, {
  //       gasLimit: 4_000_000,
  //     }),
  //     providers
  //   );
  //   ampli.systemRecallReinforcements({
  //     asteroidCoord: rockEntity,
  //     ...parseReceipt(receipt),
  //   });
  //   setTransactionLoading(false);
  // };
  // export const recallUnitsFromMotherlode = async (rockEntity: Entity, network: SetupNetworkResult) => {
  //   const { providers, systems } = network;
  //   const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  //   setTransactionLoading(true);
  //   const receipt = await execute(
  //     systems["system.RecallUnitsFromMotherlode"].executeTyped(rockEntity, {
  //       gasLimit: 4_000_000,
  //     }),
  //     providers
  //   );
  //   ampli.systemRecallReinforcements({
  //     asteroidCoord: rockEntity,
  //     ...parseReceipt(receipt),
  //   });
};
