import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { TransactionQueueType } from "src/util/constants";
import { decodeEntity, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const reinforce = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    () => network.worldContract.write.reinforce([rockEntity as Hex, key as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Reinforce, key, rockEntity),
    },
    (receipt) => {
      ampli.systemReceiveReinforcement({
        asteroidCoord: rockEntity,
        arrivalIndex: bigintToNumber(BigInt(arrivalEntity)),
        ...parseReceipt(receipt),
      });
    }
  );
};
