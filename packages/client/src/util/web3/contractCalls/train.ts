import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export const train = async (buildingEntity: Entity, unit: EUnit, count: bigint, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.trainUnits([buildingEntity as Hex, unit, count]);
  await network.waitForTransaction(tx);
};
