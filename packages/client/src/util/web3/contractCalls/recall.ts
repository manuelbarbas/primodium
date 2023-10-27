import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export const recall = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  const tx = await network.worldContract.write.recall([rockEntity as Hex, key as Hex]);
  await network.waitForTransaction(tx);
};

export const recallAll = async (rockEntity: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.recallAll([rockEntity as Hex]);
  await network.waitForTransaction(tx);
};
