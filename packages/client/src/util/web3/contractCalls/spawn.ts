import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { parseReceipt } from "../../analytics/parseReceipt";

export const spawn = async (network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.spawn(),
    network,
    { id: hashEntities("spawn") },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
