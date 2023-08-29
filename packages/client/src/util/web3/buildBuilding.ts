import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { addTileOverride, removeTileOverride } from "./override";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const buildBuilding = async (
  pos: Coord,
  blockType: EntityID,
  address: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(pos, blockType, address);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = ActiveAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...pos, parent: activeAsteroid };

  try {
    setTransactionLoading(true);
    console.log("building ", pos);
    await execute(
      systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        position,
        {
          gasLimit: 10_000_000,
        }
      ),
      providers,
      setNotification
    );
  } finally {
    removeTileOverride(tempPositionId);
  }

  setTransactionLoading(false);
};
