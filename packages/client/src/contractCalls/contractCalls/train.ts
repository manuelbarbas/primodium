import { EUnit } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { Core, getEntityTypeName, bigintToNumber, UnitEntityLookup, ExecuteFunctions } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createTrainCalls =
  ({ tables }: Core, { execute }: ExecuteFunctions) =>
  async (buildingEntity: Entity, unit: EUnit, count: bigint) => {
    await execute({
      functionName: "Pri_11__trainUnits",
      args: [buildingEntity, unit, count],
      withSession: true,
      txQueueOptions: {
        id: "TRAIN",
      },
      onComplete: (receipt) => {
        const buildingType = tables.BuildingType.get(buildingEntity)?.value;

        ampli.systemTrainUnits({
          buildingName: getEntityTypeName(buildingType as Entity),
          unitName: getEntityTypeName(UnitEntityLookup[unit]),
          unitCount: bigintToNumber(count),
          ...parseReceipt(receipt),
        });
      },
    });
  };
