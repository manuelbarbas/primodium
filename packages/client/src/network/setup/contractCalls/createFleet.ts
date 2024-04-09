import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

export const createFleet = async (
  mud: MUD,
  asteroidEntity: Entity,
  deltas: Map<Entity, bigint>,
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  await execute(
    {
      mud,
      functionName: "Primodium__createFleet",
      systemId: getSystemId("FleetCreateSystem"),
      args: [asteroidEntity as Hex, toUnitCountArray(deltas), toTransportableResourceArray(deltas)],
      withSession: true,
    },
    {
      id: "TRANSFER" as Entity,
      type: TransactionQueueType.CreateFleet,
      ...options,
    },
    () => {
      makeObjectiveClaimable(asteroidEntity, EObjectives.CreateFleet);
    }
  );
};
