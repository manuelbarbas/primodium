import { primodium } from "@game/api";
import { EntityID } from "@latticexyz/recs";
import { useCallback, useMemo } from "react";
import { decodeCoordEntity } from "src/util/encode";
import { buildBuilding } from "src/util/web3";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { BlockType } from "../../util/constants";
import { MainBase } from "src/network/components/chainComponents";
import { SingletonID } from "@latticexyz/network";
import { SelectedTile } from "src/network/components/clientComponents";

export default function NavigateMainBaseButton() {
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? (address.toString().toLowerCase() as EntityID)
    : SingletonID;

  const mainBaseEntity = MainBase.use(resourceKey)?.value;
  // fetch the main base of the user based on address
  const mainBaseCoord = useMemo(() => {
    if (mainBaseEntity) return decodeCoordEntity(mainBaseEntity);
    return undefined;
  }, [mainBaseEntity]);
  // Navigate to Main Base if it exists for this wallet
  const navigateMainBase = useCallback(() => {
    if (mainBaseCoord) {
      primodium.camera.pan(mainBaseCoord);
      SelectedTile.set(mainBaseCoord);
    }
  }, [mainBaseCoord]);

  // Otherwise build a main base
  const network = useMud();

  const buildMainBase = async () => {
    const cameraCoord = primodium.camera.getPosition();
    const selectedTile = SelectedTile.get();

    if (!selectedTile) return SelectedTile.set(cameraCoord);

    await buildBuilding(selectedTile, BlockType.MainBase, address, network);
  };

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
