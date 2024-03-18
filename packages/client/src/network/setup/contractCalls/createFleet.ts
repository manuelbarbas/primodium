import { Entity } from "@latticexyz/recs";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

export const createFleet = async (
  mud: MUD,
  spaceRock: Entity,
  deltas: Map<Entity, bigint>,
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  await execute(
    {
      mud,
      functionName: "Primodium__createFleet",
      systemId: getSystemId("FleetCreateSystem"),
      args: [spaceRock as Hex, toUnitCountArray(deltas), toTransportableResourceArray(deltas)],
      withSession: true,
    },
    {
      id: "TRANSFER" as Entity,
      type: TransactionQueueType.CreateFleet,
      ...options,
    }
  );
};
