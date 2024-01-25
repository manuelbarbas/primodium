import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { getAsteroidBounds } from "src/util/outOfBounds";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeRange = async (mud: MUD, asteroid: Entity) => {
  await execute(
    {
      mud,
      functionName: "upgradeRange",
      systemId: getSystemId("UpgradeRangeSystem"),
      args: [asteroid as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Upgrade, mud.playerAccount.entity),
    },
    (receipt) => {
      const level = components.Level.get(asteroid)?.value ?? 1n;
      const bounds = getAsteroidBounds(asteroid);

      ampli.systemUpgradeRange({
        asteroidCoord: asteroid,
        currLevel: bigintToNumber(level),
        currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
        ...parseReceipt(receipt),
      });
    }
  );
};
