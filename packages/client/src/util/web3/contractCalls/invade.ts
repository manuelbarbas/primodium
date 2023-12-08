import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const invade = async (destination: Entity, network: SetupNetworkResult, key?: Hex | Entity) => {
  await execute(
    () => network.worldContract.write.invade([destination as Hex]),
    network,
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
