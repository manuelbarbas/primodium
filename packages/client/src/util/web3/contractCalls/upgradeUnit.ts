import { EUnit } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const upgradeUnit = async (unit: EUnit, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.upgradeUnit([unit]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, UnitEntityLookup[unit]),
    },
    (receipt) => {
      // ampli.systemUpgradeRange({
      //   asteroidCoord: BigNumber.from(activeAsteroid).toString(),
      //   currLevel: level,
      //   currBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
      //   ...parseReceipt(receipt),
      // });
    }
  );
};
