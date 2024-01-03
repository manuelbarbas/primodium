import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeUnit = async (network: SetupNetworkResult, account: AnyAccount, spaceRock: Entity, unit: EUnit) => {
  await execute(
    () => account.worldContract.write.upgradeUnit([spaceRock as Hex, unit]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, UnitEntityLookup[unit]),
    },
    (receipt) => {
      const unitLevel =
        components.UnitLevel.getWithKeys({ entity: account.entity as Hex, unit: UnitEntityLookup[unit] as Hex })
          ?.value ?? 0n;

      ampli.systemUpgradeUnit({
        currLevel: bigintToNumber(unitLevel),
        unitName: getBlockTypeName(UnitEntityLookup[unit]),
        ...parseReceipt(receipt),
      });
    }
  );
};
