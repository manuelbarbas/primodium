import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const raid = async (mud: MUD, rockEntity: Entity, key?: Entity | Hex) => {
  await execute(
    {
      mud,
      functionName: "raid",
      systemId: getSystemId("RaidSystem"),
      args: [rockEntity as Hex],
      delegate: true,
    },
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
