import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getPlayerBounds } from "src/util/outOfBounds";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

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
