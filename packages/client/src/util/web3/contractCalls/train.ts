import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { getBlockTypeName, randomEntity } from "src/util/common";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { parseReceipt } from "../../analytics/parseReceipt";

export const train = async (buildingEntity: Entity, unit: EUnit, count: bigint, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.trainUnits([buildingEntity as Hex, unit, count]),
    network,
    {
      id: randomEntity(),
    },
    (receipt) => {
      const buildingType = components.BuildingType.get(buildingEntity)?.value as Entity;

      ampli.systemTrainUnits({
        buildingName: getBlockTypeName(buildingType),
        unitName: EUnit[unit],
        unitCount: bigintToNumber(count),
        ...parseReceipt(receipt),
      });
    }
  );
};
