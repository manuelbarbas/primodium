import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { decodeEntity } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const raid = async (arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("No rock entity found for arrival entity");
  await execute(
    () => network.worldContract.write.raid([rockEntity as Hex]),
    network,
    {
      id: key as Entity,
    },
    (receipt) => {
      ampli.systemRaid({
        asteroidCoord: rockEntity,
        ...parseReceipt(receipt),
      });
    }
  );
};
