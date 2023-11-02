import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { parseReceipt } from "../../analytics/parseReceipt";

export const raid = async (rockEntity: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.raid([rockEntity as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Land, rockEntity),
    },
    (receipt) => {
      ampli.systemRaid({
        asteroidCoord: rockEntity,
        ...parseReceipt(receipt),
      });
    }
  );
};
