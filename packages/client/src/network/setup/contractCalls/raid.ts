import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const raid = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  rockEntity: Entity,
  key?: Entity | Hex
) => {
  await execute(
    () => account.worldContract.write.raid([rockEntity as Hex]),
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
