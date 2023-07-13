import { primodium } from "@game/api";
import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { useCallback, useMemo } from "react";
import { decodeCoordEntity } from "src/util/encode";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { useComponentValue } from "../../hooks/useComponentValue";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { BlockType } from "../../util/constants";
export default function NavigateMainBaseButton() {
  const { world, components, singletonIndex } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  const mainBaseEntity = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  )?.value;

  // fetch the main base of the user based on address
  const mainBaseCoord = useMemo(() => {
    if (mainBaseEntity) return decodeCoordEntity(mainBaseEntity as EntityID);
    return undefined;
  }, [mainBaseEntity]);
  // Navigate to Main Base if it exists for this wallet
  const navigateMainBase = useCallback(() => {
    if (mainBaseCoord) {
      primodium.camera.pan(mainBaseCoord);
      primodium.components.selectedTile(network).set(mainBaseCoord);
    }
  }, [mainBaseCoord]);

  // Otherwise build a main base
  const network = useMud();
  const { systems, providers } = network;

  const [setTransactionLoading] = useGameStore((state) => [
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const buildMainBase = useCallback(async () => {
    setTransactionLoading(true);
    const cameraCoord = primodium.camera.getPosition();
    const selectedTile = primodium.components.selectedTile(network).get();

    if (!selectedTile)
      primodium.components.selectedTile(network).set(cameraCoord);

    await execute(
      systems["system.Build"].executeTyped(
        BigNumber.from(BlockType.MainBase),
        selectedTile ?? cameraCoord,
        {
          gasLimit: 2_800_000,
        }
      ),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  }, [network]);

  if (mainBaseCoord) {
    return (
      <div className="absolute inset-x-4 bottom-4 flex">
        <button
          onClick={navigateMainBase}
          className="h-10 bg-orange-600 hover:bg-amber-700 text-sm rounded font-bold w-full"
        >
          Main Base ({mainBaseCoord.x},{mainBaseCoord.y})
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-4 flex">
        <button
          onClick={buildMainBase}
          className="h-10 bg-orange-600 hover:bg-amber-700 text-sm rounded font-bold w-full"
        >
          Build a Main Base
        </button>
      </div>
    );
  }
}
