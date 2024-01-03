import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { decodeEntity } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const reinforce = async (network: SetupNetworkResult, account: AnyAccount, arrivalEntity: Entity) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("No rock entity found for arrival entity");
  await execute(
    () => account.worldContract.write.reinforce([rockEntity as Hex, key as Hex]),
    network,
    {
      id: key as Entity,
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
