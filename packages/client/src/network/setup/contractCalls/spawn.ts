import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (mud: MUD) => {
  await execute(
    mud,
    (account) => account.worldContract.write.spawn(),
    { id: world.registerEntity() },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
