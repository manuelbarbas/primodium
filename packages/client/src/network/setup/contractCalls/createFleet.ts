import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { ResourceEnumLookup, TransactionQueueType, UnitEnumLookup } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const attack = async (
  mud: MUD,
  spaceRock: Entity,
  units: Record<Entity, bigint>,
  resources: Record<Entity, bigint>
) => {
  const unitArray = Object.entries(units).reduce((acc, [entity, amount]) => {
    acc[UnitEnumLookup[entity as Entity]] = amount;
    return acc;
  }, [] as bigint[]);

  const resourceArray = Object.entries(resources).reduce((acc, [entity, amount]) => {
    acc[ResourceEnumLookup[entity as Entity]] = amount;
    return acc;
  }, [] as bigint[]);
  await execute(
    {
      mud,
      functionName: "createFleet",
      systemId: getSystemId("FleetCreateSystem"),
      args: [spaceRock as Hex, unitArray, resourceArray],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.CreateFleet, spaceRock),
      type: TransactionQueueType.CreateFleet,
    }
  );
};
