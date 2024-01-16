import { Coord } from "@latticexyz/utils";
import { EBuilding } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { getBuildingTopLeft } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { BuildingEntityLookup, TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const buildBuilding = async (mud: MUD, building: EBuilding, coord: Coord) => {
  const activeAsteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid as Hex };

  await execute(
    {
      mud,
      functionName: "build",
      systemId: getSystemId("BuildSystem"),
      args: [building, position],
      delegate: true,
      options: { gas: 7000000n },
    },
    {
      id: hashEntities(TransactionQueueType.Build, coord.x, coord.y),
      type: TransactionQueueType.Build,
      metadata: {
        coord: getBuildingTopLeft(coord, BuildingEntityLookup[building]),
        buildingType: BuildingEntityLookup[building],
      },
    },
    (receipt) => {
      ampli.systemBuild({
        asteroidCoord: activeAsteroid,
        buildingType: getBlockTypeName(BuildingEntityLookup[building]),
        coord: [coord.x, coord.y],
        currLevel: 0,
        ...parseReceipt(receipt),
      });
    }
  );
};
