import { Entity } from "@latticexyz/recs";
import { EBuilding, EUnit, MUDEnums } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { hashEntities } from "src/util/encode";
import { uuid } from "@latticexyz/utils";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { parseReceipt } from "../../analytics/parseReceipt";

export const train = async (buildingEntity: Entity, unit: EUnit, count: bigint, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.trainUnits([buildingEntity as Hex, unit, count]),
    network,
    {
      id: hashEntities(uuid()),
    },
    (receipt) => {
      const buildingType = components.BuildingType.get(buildingEntity)?.value as unknown as EBuilding;

      ampli.systemTrainUnits({
        buildingName: MUDEnums.EBuilding[buildingType],
        unitName: MUDEnums.EUnit[unit],
        unitCount: bigintToNumber(count),
        ...parseReceipt(receipt),
      });
    }
  );
};
