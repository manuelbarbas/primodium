import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const raid = async (rockEntity: Entity, network: SetupNetworkResult, key?: Entity | Hex) => {
  await execute(
    () => network.worldContract.write.raid([rockEntity as Hex]),
    network,
    {
      id: (key ?? rockEntity) as Entity,
    },
    (receipt) => {
      ampli.systemRaid({
        asteroidCoord: rockEntity,
        ...parseReceipt(receipt),
      });
    }
  );
};
