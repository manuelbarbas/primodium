import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeUnit = async (mud: MUD, spaceRock: Entity, unit: EUnit) => {
  await execute(
    {
      mud,
      functionName: "upgradeUnit",
      systemId: getSystemId("UpgradeUnitSystem"),
      args: [spaceRock as Hex, unit],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Upgrade, UnitEntityLookup[unit]),
    },
    (receipt) => {
      const unitLevel =
        components.UnitLevel.getWithKeys({
          entity: mud.playerAccount.entity as Hex,
          unit: UnitEntityLookup[unit] as Hex,
        })?.value ?? 0n;

      ampli.systemUpgradeUnit({
        currLevel: bigintToNumber(unitLevel),
        unitName: getBlockTypeName(UnitEntityLookup[unit]),
        ...parseReceipt(receipt),
      });
    }
  );
};
