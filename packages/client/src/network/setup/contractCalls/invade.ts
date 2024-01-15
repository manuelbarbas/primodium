import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const invade = async (mud: MUD, destination: Entity, key?: Hex | Entity) => {
  await execute(
    {
      mud,
      functionName: "invade",
      systemId: getSystemId("InvadeSystem"),
      args: [destination as Hex],
      delegate: true,
    },
    {
      id: (key ?? destination) as Entity,
    },
    (receipt) => {
      ampli.systemInvade({
        asteroidCoord: destination,
        ...parseReceipt(receipt),
      });
    }
  );
};
