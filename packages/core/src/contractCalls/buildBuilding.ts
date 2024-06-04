import { Coord } from "engine/types";
import { EBuilding } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getBuildingBottomLeft } from "src/util/building";
import { getEntityTypeName } from "src/util/common";
import { BuildingEntityLookup, TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const buildBuilding = async (
  mud: MUD,
  building: EBuilding,
  coord: Coord & { parentEntity?: Hex },
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  const activeAsteroid = components.ActiveRock.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parentEntity: coord.parentEntity ?? (activeAsteroid as Hex) };

  await execute(
    {
      mud,
      functionName: "Pri_11__build",
      systemId: getSystemId("BuildSystem"),
      args: [building, position],
      withSession: true,
      options: { gas: 7000000n },
    },
    {
      id: hashEntities(TransactionQueueType.Build, coord.x, coord.y),
      type: TransactionQueueType.Build,
      metadata: {
        coord: getBuildingBottomLeft(coord, BuildingEntityLookup[building]),
        buildingType: BuildingEntityLookup[building],
      },
      ...options,
    },
    (receipt) => {
      ampli.systemBuild({
        asteroidCoord: activeAsteroid,
        buildingType: getEntityTypeName(BuildingEntityLookup[building]),
        coord: [coord.x, coord.y],
        currLevel: 0,
        ...parseReceipt(receipt),
      });
    }
  );
};
