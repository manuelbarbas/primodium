import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { addTileOverride, removeTileOverride } from "./override";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { ampli } from "src/ampli";
import { BlockIdToKey } from "../constants";
import { parseReceipt } from "../analytics/parseReceipt";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const buildBuilding = async (
  coord: Coord,
  blockType: EntityID,
  address: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(coord, blockType, address);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);

  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  try {
    const receipt = await execute(
      systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        position,
        {
          gasLimit: 15_000_000,
        }
      ),
      providers
    );

    ampli.systemBuild({
      asteroidCoord: BigNumber.from(activeAsteroid).toString(),
      buildingType: BlockIdToKey[blockType],
      coord: [coord.x, coord.y],
      currLevel: 0,
      ...parseReceipt(receipt),
    });
  } finally {
    removeTileOverride(tempPositionId);
  }

  setTransactionLoading(false);
};
