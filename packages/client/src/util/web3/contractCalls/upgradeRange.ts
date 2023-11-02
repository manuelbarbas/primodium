import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const upgradeRange = async (network: SetupNetworkResult) => {
  await execute(() => network.worldContract.write.upgradeRange(), network, {
    id: hashEntities(TransactionQueueType.Upgrade, network.playerEntity),
  });
};
