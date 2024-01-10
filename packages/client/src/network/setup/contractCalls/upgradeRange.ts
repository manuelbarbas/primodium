import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getPlayerBounds } from "src/util/outOfBounds";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeRange = async (mud: MUD, asteroid: Entity) => {
  await execute(
    mud,
    (account) => account.worldContract.write.upgradeRange([asteroid as Hex]),
    {
      id: hashEntities(TransactionQueueType.Upgrade, mud.playerAccount.entity),
      delegate: true,
    },
    (receipt) => {
      const entity = mud.playerAccount.entity;
      const asteroid = components.Home.get(entity)?.asteroid;
      const level = components.Level.get(entity)?.value ?? 1n;
      const bounds = getPlayerBounds(entity);

      ampli.systemUpgradeRange({
        asteroidCoord: asteroid!,
        currLevel: bigintToNumber(level),
        currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
        ...parseReceipt(receipt),
      });
    }
  );
};
