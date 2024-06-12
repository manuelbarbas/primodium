import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { Core, getSystemId, getEntityTypeName, bigintToNumber, UnitEntityLookup } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/util/analytics/parseReceipt";

export const createTrainCalls =
  ({ tables }: Core, { execute }: ExecuteFunctions) =>
  async (buildingEntity: Entity, unit: EUnit, count: bigint) => {
    await execute(
      {
        functionName: "Pri_11__trainUnits",
        systemId: getSystemId("TrainUnitsSystem"),
        args: [buildingEntity, unit, count],
        withSession: true,
      },
      {
        id: "TRAIN",
      },
      (receipt) => {
        const buildingType = tables.BuildingType.get(buildingEntity)?.value;

        ampli.systemTrainUnits({
          buildingName: getEntityTypeName(buildingType as Entity),
          unitName: getEntityTypeName(UnitEntityLookup[unit]),
          unitCount: bigintToNumber(count),
          ...parseReceipt(receipt),
        });
      }
    );
  };
