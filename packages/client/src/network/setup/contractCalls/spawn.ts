import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (mud: MUD) => {
  await execute(
    mud,
    (account) => account.worldContract.write.spawn(),
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
