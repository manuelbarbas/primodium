import { Coord, uuid } from "@latticexyz/utils";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { EBuilding, MUDEnums } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { execute } from "src/network/actions";
import { parseReceipt } from "../../analytics/parseReceipt";
import { BuildingEntityLookup, TransactionQueueType } from "src/util/constants";

export const buildBuilding = async (network: SetupNetworkResult, building: EBuilding, coord: Coord) => {
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid as Hex };

  await execute(
    network.worldContract.write.build([building, position]),
    network,
    {
      id: uuid() as Entity,
      type: TransactionQueueType.Build,
      metadata: {
        coord,
        buildingType: BuildingEntityLookup[building],
      },
    },
    (receipt) => {
      ampli.systemBuild({
        asteroidCoord: BigNumber.from(activeAsteroid).toString(),
        buildingType: MUDEnums.EBuilding[building],
        coord: [coord.x, coord.y],
        currLevel: 0,
        ...parseReceipt(receipt),
      });
    }
  );
};
