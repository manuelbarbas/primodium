import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { components } from "src/network/components";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getPlayerBounds } from "src/util/outOfBounds";
import { bigintToNumber } from "src/util/bigint";

export const upgradeRange = async (asteroid: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.upgradeRange([asteroid as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, network.playerEntity),
    },
    (receipt) => {
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;
      const playerEntity = components.Account.get()?.value;
      const level = components.Level.get(playerEntity)?.value ?? 1n;
      const bounds = getPlayerBounds(playerEntity!);

      ampli.systemUpgradeRange({
        asteroidCoord: asteroid!,
        currLevel: bigintToNumber(level),
        currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
        ...parseReceipt(receipt),
      });
    }
  );
};
