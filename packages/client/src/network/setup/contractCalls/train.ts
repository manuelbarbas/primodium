import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { getBlockTypeName } from "src/util/common";
import { UnitEntityLookup } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const train = async (mud: MUD, buildingEntity: Entity, unit: EUnit, count: bigint) => {
  await execute(
    {
      mud,
      functionName: "Primodium__trainUnits",
      systemId: getSystemId("TrainUnitsSystem"),
      args: [buildingEntity as Hex, unit, count],
      withSession: true,
    },
    {
      id: "TRAIN" as Entity,
    },
    (receipt) => {
      const buildingType = components.BuildingType.get(buildingEntity)?.value as Entity;

      ampli.systemTrainUnits({
        buildingName: getBlockTypeName(buildingType),
        unitName: getBlockTypeName(UnitEntityLookup[unit]),
        unitCount: bigintToNumber(count),
        ...parseReceipt(receipt),
      });
    }
  );
};
