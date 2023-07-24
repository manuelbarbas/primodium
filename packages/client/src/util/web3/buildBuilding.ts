import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { addTileOverride, removeTileOverride } from "./override";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

export const buildBuilding = async (
  pos: Coord,
  blockType: EntityID,
  address: string,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(pos, blockType, address, network);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  try {
    setTransactionLoading(true);
    console.log("building ", pos);
    await execute(
      systems["system.Build"].executeTyped(BigNumber.from(blockType), pos, {
        gasLimit: 5_000_000,
      }),
      providers,
      setNotification
    );
  } finally {
    removeTileOverride(tempPositionId, network);
  }

  setTransactionLoading(false);
};
