import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";

export const train = async (buildingEntity: Entity, type: Entity, count: number, network: SetupNetworkResult) => {
  // const receipt = await execute(
  //   systems["system.TrainUnits"].executeTyped(buildingEntity, type, count, {
  //     gasLimit: 28_000_000,
  //   }),
  //   providers
  // );
  // ampli.systemTrainUnits({
  //   buildingName: BlockIdToKey[buildingEntity],
  //   unitName: BlockIdToKey[type],
  //   unitCount: count,
  //   ...parseReceipt(receipt),
  // });
};
