import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { decodeEntity, getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const reinforce = async (mud: MUD, arrivalEntity: Entity) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("No rock entity found for arrival entity");
  await execute(
    {
      mud,
      functionName: "reinforce",
      systemId: getSystemId("ReinforceSystem"),
      args: [rockEntity as Hex, key as Hex],
      delegate: true,
    },
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
