import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";

export const spawn = async (network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.spawn(),
    network,
    { id: "spawn" },
    (receipt) => {
      // handle amplitude here
    }
  );
};
