import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const invade = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  destination: Entity,
  key?: Hex | Entity
) => {
  await execute(
    () => account.worldContract.write.invade([destination as Hex]),
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
