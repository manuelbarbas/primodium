import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const raid = async (mud: MUD, rockEntity: Entity, key?: Entity | Hex) => {
  await execute(
    mud,
    (account) => account.worldContract.write.raid([rockEntity as Hex]),
    {
      id: (key ?? rockEntity) as Entity,
      delegate: true,
    },
    (receipt) => {
      ampli.systemRaid({
        asteroidCoord: rockEntity,
        ...parseReceipt(receipt),
      });
    }
  );
};
