import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";
const metadata = {
  id: "TRANSFER" as Entity,
  type: TransactionQueueType.TransferFleet,
} as const;
export const transfer = async (mud: MUD, left: Entity, right: Entity, deltas: Map<Entity, bigint>) => {
  if ([...deltas.values()].every((count) => count == 0n)) return;
  const unitCounts = toUnitCountArray(deltas);
  const resourceCounts = toTransportableResourceArray(deltas);

  const allCounts = [...resourceCounts, ...unitCounts];
  const allSameSign = allCounts.every((count) => count >= 0n) || allCounts.every((count) => count <= 0n);

  if (!allSameSign) {
    await transferTwoWay(mud, left, right, {
      unitCounts: unitCounts,
      resourceCounts: resourceCounts,
    });
    return;
  }

  await transferOneWay(mud, left, right, {
    unitCounts: unitCounts,
    resourceCounts: resourceCounts,
  });
};

const transferOneWay = async (
  mud: MUD,
  left: Entity,
  right: Entity,
  {
    unitCounts,
    resourceCounts,
  }: {
    unitCounts: bigint[];
    resourceCounts: bigint[];
  }
) => {
  const activeAsteroid = components.ActiveRock.get()?.value;
  const anyNegative = unitCounts?.some((count) => count < 0n) || resourceCounts?.some((count) => count < 0n);

  let from = left;
  let to = right;
  if (anyNegative) {
    from = right;
    to = left;
    unitCounts?.forEach((count, i) => (unitCounts[i] = -count));
    resourceCounts?.forEach((count, i) => (resourceCounts[i] = -count));
  }
  const fromIsAsteroid = components.Asteroid.has(from);
  const toIsAsteroid = components.Asteroid.has(to);

  const claimableObjective = fromIsAsteroid ? EObjectives.TransferFromAsteroid : EObjectives.TransferFromFleet;

  if (resourceCounts.every((count) => count == 0n)) {
    const functionName = fromIsAsteroid
      ? "Primodium__transferUnitsFromAsteroidToFleet"
      : toIsAsteroid
      ? "Primodium__transferUnitsFromFleetToAsteroid"
      : "Primodium__transferUnitsFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, unitCounts],
        withSession: true,
      },
      metadata,
      () => activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective)
    );
  } else if (unitCounts.every((count) => count == 0n)) {
    const functionName = fromIsAsteroid
      ? "Primodium__transferResourcesFromAsteroidToFleet"
      : toIsAsteroid
      ? "Primodium__transferResourcesFromFleetToAsteroid"
      : "Primodium__transferResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, resourceCounts],
        withSession: true,
      },
      metadata,
      () => activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective)
    );
  } else {
    const functionName = fromIsAsteroid
      ? "Primodium__transferUnitsAndResourcesFromAsteroidToFleet"
      : toIsAsteroid
      ? "Primodium__transferUnitsAndResourcesFromFleetToAsteroid"
      : "Primodium__transferUnitsAndResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, unitCounts, resourceCounts],
        withSession: true,
      },
      metadata,
      () => activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective)
    );
  }
};
const transferTwoWay = async (
  mud: MUD,
  left: Entity,
  right: Entity,
  {
    unitCounts,
    resourceCounts,
  }: {
    unitCounts: bigint[];
    resourceCounts: bigint[];
  }
) => {
  const noUnits = unitCounts.every((count) => count == 0n);
  const noResources = resourceCounts.every((count) => count == 0n);
  if (noUnits && noResources) return;
  if (noResources) {
    return await execute(
      {
        mud,
        functionName: "Primodium__transferUnitsTwoWay",
        systemId: getSystemId("TransferTwoWaySystem"),
        args: [left as Hex, right as Hex, unitCounts],
        withSession: true,
      },
      metadata
    );
  }
  if (noUnits) {
    return await execute(
      {
        mud,
        functionName: "Primodium__transferResourcesTwoWay",
        systemId: getSystemId("TransferTwoWaySystem"),
        args: [left as Hex, right as Hex, resourceCounts],
        withSession: true,
      },
      metadata
    );
  }

  await execute(
    {
      mud,
      functionName: "Primodium__transferUnitsAndResourcesTwoWay",
      systemId: getSystemId("TransferTwoWaySystem"),
      args: [left as Hex, right as Hex, unitCounts, resourceCounts],
      withSession: true,
    },
    metadata
  );
};
