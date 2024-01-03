import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getPlayerBounds } from "src/util/outOfBounds";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeRange = async (network: SetupNetworkResult, account: AnyAccount, asteroid: Entity) => {
  await execute(
    () => account.worldContract.write.upgradeRange([asteroid as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, account.entity),
    },
    (receipt) => {
      const asteroid = components.Home.get(account.entity)?.asteroid;
      const level = components.Level.get(account.entity)?.value ?? 1n;
      const bounds = getPlayerBounds(account.entity);

      ampli.systemUpgradeRange({
        asteroidCoord: asteroid!,
        currLevel: bigintToNumber(level),
        currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
        ...parseReceipt(receipt),
      });
    }
  );
};
