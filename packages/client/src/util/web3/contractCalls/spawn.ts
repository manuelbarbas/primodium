import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { parseReceipt } from "../../analytics/parseReceipt";

export const spawn = async (network: SetupNetworkResult) => {
  await execute(
    () => network.playerAccount.worldContract.write.spawn(),
    network,
    { id: world.registerEntity() },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
