import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

export const createFleet = async (mud: MUD, spaceRock: Entity, deltas: Map<Entity, bigint>) => {
  await execute(
    {
      mud,
      functionName: "createFleet",
      systemId: getSystemId("FleetCreateSystem"),
      args: [spaceRock as Hex, toUnitCountArray(deltas), toTransportableResourceArray(deltas)],
      delegate: true,
    },
    {
      id: "TRANSFER" as Entity,
      type: TransactionQueueType.CreateFleet,
    }
  );
};
