import { Entity } from "@latticexyz/recs";
import { EObjectives, EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getEntityTypeName } from "src/util/common";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeUnit = async (mud: MUD, spaceRock: Entity, unit: EUnit) => {
  await execute(
    {
      mud,
      functionName: "Primodium__upgradeUnit",
      systemId: getSystemId("UpgradeUnitSystem"),
      args: [spaceRock as Hex, unit],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.Upgrade, UnitEntityLookup[unit]),
    },
    (receipt) => {
      makeObjectiveClaimable(spaceRock, EObjectives.UpgradeUnit);
      const unitLevel =
        components.UnitLevel.getWithKeys({
          entity: mud.playerAccount.entity as Hex,
          unit: UnitEntityLookup[unit] as Hex,
        })?.value ?? 0n;

      ampli.systemUpgradeUnit({
        currLevel: bigintToNumber(unitLevel),
        unitName: getEntityTypeName(UnitEntityLookup[unit]),
        ...parseReceipt(receipt),
      });
    }
  );
};
