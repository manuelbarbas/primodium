import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (network: SetupNetworkResult, account: AnyAccount) => {
  await execute(
    () => account.worldContract.write.spawn(),
    network,
    { id: world.registerEntity() },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
