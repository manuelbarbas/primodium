import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { parseReceipt } from "../../analytics/parseReceipt";
import { randomEntity } from "src/util/common";

export const spawn = async (network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.spawn(),
    network,
    { id: randomEntity() },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
