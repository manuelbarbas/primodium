import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { addTileOverride, removeTileOverride } from "./override";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ampli } from "src/ampli";
import { BlockIdToKey } from "../constants";
import { parseReceipt } from "../analytics/parseReceipt";

export const buildBuilding = async (
  coord: Coord,
  blockType: EntityID,
  address: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(coord, blockType, address);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;
  setTransactionLoading(true);

  try {
    const receipt = await execute(
      systems["system.Build"].executeTyped(BigNumber.from(blockType), coord, {
        gasLimit: 5_000_000,
      }),
      providers,
      setNotification
    );

    ampli.systemBuild({
      buildingType: BlockIdToKey[blockType],
      coord: [coord.x, coord.y, 0],
      currLevel: 0,
      ...parseReceipt(receipt),
    });
  } finally {
    removeTileOverride(tempPositionId);
  }

  setTransactionLoading(false);
};
