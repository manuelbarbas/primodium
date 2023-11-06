import { Hex } from "viem";
import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getBlockTypeName } from "src/util/common";
import { components } from "src/network/components";
import { parseReceipt } from "../../analytics/parseReceipt";
import { bigintToNumber } from "src/util/bigint";

export const upgradeUnit = async (unit: EUnit, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.upgradeUnit([unit]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, UnitEntityLookup[unit]),
    },
    (receipt) => {
      const unitLevel =
        components.UnitLevel.getWithKeys({ entity: network.playerEntity as Hex, unit: UnitEntityLookup[unit] as Hex })
          ?.value ?? 0n;

      ampli.systemUpgradeUnit({
        currLevel: bigintToNumber(unitLevel),
        unitName: getBlockTypeName(UnitEntityLookup[unit]),
        ...parseReceipt(receipt),
      });
    }
  );
};
