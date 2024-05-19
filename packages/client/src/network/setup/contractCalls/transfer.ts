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
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";
import { bigintToNumber } from "src/util/number";

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
      ? "Pri_11__transferUnitsFromAsteroidToFleet"
      : toIsAsteroid
      ? "Pri_11__transferUnitsFromFleetToAsteroid"
      : "Pri_11__transferUnitsFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, unitCounts],
        withSession: true,
      },
      metadata,
      (receipt) => {
        activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective);

        const commonProperties = {
          spaceRock: from as Hex,
          spaceRockTo: to as Hex,
          unitCounts: unitCounts.map((unitCount) => bigintToNumber(unitCount)),
          ...parseReceipt(receipt),
        };

        if (fromIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferUnitsFromAsteroidToFleet(commonProperties);
        } else if (toIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferUnitsFromFleetToAsteroid(commonProperties);
        } else {
          ampli.systemTransferSystemPrimodiumTransferUnitsFromFleetToFleet(commonProperties);
        }
      }
    );
  } else if (unitCounts.every((count) => count == 0n)) {
    const functionName = fromIsAsteroid
      ? "Pri_11__transferResourcesFromAsteroidToFleet"
      : toIsAsteroid
      ? "Pri_11__transferResourcesFromFleetToAsteroid"
      : "Pri_11__transferResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, resourceCounts],
        withSession: true,
      },
      metadata,
      (receipt) => {
        activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective);

        const commonProperties = {
          spaceRock: from as Hex,
          spaceRockTo: to as Hex,
          resourceCounts: resourceCounts.map((resourceCount) => bigintToNumber(resourceCount)),
          ...parseReceipt(receipt),
        };

        if (fromIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferResourcesFromAsteroidToFleet(commonProperties);
        } else if (toIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferResourcesFromFleetToAsteroid(commonProperties);
        } else {
          ampli.systemTransferSystemPrimodiumTransferResourcesFromFleetToFleet(commonProperties);
        }
      }
    );
  } else {
    const functionName = fromIsAsteroid
      ? "Pri_11__transferUnitsAndResourcesFromAsteroidToFleet"
      : toIsAsteroid
      ? "Pri_11__transferUnitsAndResourcesFromFleetToAsteroid"
      : "Pri_11__transferUnitsAndResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("TransferSystem"),
        args: [from as Hex, to as Hex, unitCounts, resourceCounts],
        withSession: true,
      },
      metadata,
      (receipt) => {
        activeAsteroid && makeObjectiveClaimable(mud.playerAccount.entity, claimableObjective);

        const commonProperties = {
          spaceRock: from as Hex,
          spaceRockTo: to as Hex,
          unitCounts: unitCounts.map((unitCount) => bigintToNumber(unitCount)),
          resourceCounts: resourceCounts.map((resourceCount) => bigintToNumber(resourceCount)),
          ...parseReceipt(receipt),
        };

        if (fromIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferUnitsAndResourcesFromAsteroidToFleet(commonProperties);
        } else if (toIsAsteroid) {
          ampli.systemTransferSystemPrimodiumTransferUnitsAndResourcesFromFleetToAsteroid(commonProperties);
        } else {
          ampli.systemTransferSystemPrimodiumTransferUnitsAndResourcesFromFleetToFleet(commonProperties);
        }
      }
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
        functionName: "Pri_11__transferUnitsTwoWay",
        systemId: getSystemId("TransferTwoWaySystem"),
        args: [left as Hex, right as Hex, unitCounts],
        withSession: true,
      },
      metadata,
      (receipt) => {
        ampli.systemTransferTwoWaySystemPrimodiumTransferUnitsTwoWay({
          spaceRock: left as Hex,
          spaceRockTo: right as Hex,
          unitCounts: unitCounts.map((unitCount) => bigintToNumber(unitCount)),
          ...parseReceipt(receipt),
        });
      }
    );
  }
  if (noUnits) {
    return await execute(
      {
        mud,
        functionName: "Pri_11__transferResourcesTwoWay",
        systemId: getSystemId("TransferTwoWaySystem"),
        args: [left as Hex, right as Hex, resourceCounts],
        withSession: true,
      },
      metadata,
      (receipt) => {
        ampli.systemTransferTwoWaySystemPrimodiumTransferResourcesTwoWay({
          spaceRock: left as Hex,
          spaceRockTo: right as Hex,
          resourceCounts: resourceCounts.map((resourceCount) => bigintToNumber(resourceCount)),
          ...parseReceipt(receipt),
        });
      }
    );
  }

  await execute(
    {
      mud,
      functionName: "Pri_11__transferUnitsAndResourcesTwoWay",
      systemId: getSystemId("TransferTwoWaySystem"),
      args: [left as Hex, right as Hex, unitCounts, resourceCounts],
      withSession: true,
    },
    metadata,
    (receipt) => {
      ampli.systemTransferTwoWaySystemPrimodiumTransferUnitsAndResourcesTwoWay({
        spaceRock: left as Hex,
        spaceRockTo: right as Hex,
        unitCounts: unitCounts.map((unitCount) => bigintToNumber(unitCount)),
        resourceCounts: resourceCounts.map((resourceCount) => bigintToNumber(resourceCount)),
        ...parseReceipt(receipt),
      });
    }
  );
};
