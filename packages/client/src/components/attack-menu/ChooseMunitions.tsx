import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import { execute } from "../../network/actions";

import MunitionsButton from "./MunitionsButton";
import { useSelectedTile } from "../../context/SelectedTileContext";

function ChooseMunitions() {
  // executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey)

  const {
    selectedStartPathTile,
    selectedEndPathTile,
    setSelectedStartPathTile,
    setSelectedEndPathTile,
  } = useSelectedTile();

  const { systems, providers } = useMud();
  const { setTransactionLoading } = useTransactionLoading();

  const attackAction = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Attack"].executeTyped(
        {
          x: selectedStartPathTile.x,
          y: selectedStartPathTile.y,
        },
        {
          x: selectedEndPathTile.x,
          y: selectedEndPathTile.y,
        },
        0,
        {
          gasLimit: 30_000_000,
        }
      ),
      providers
    );
    setTransactionLoading(false);
  }, []);

  return (
    <div className="pr-4">
      <div className="mb-3">Select munition used for launch </div>
      <MunitionsButton icon={"/img/crafted/kineticmissile.png"} quantity={6} />
      <MunitionsButton
        icon={"/img/crafted/penetratingmissile.png"}
        quantity={116}
      />
      <MunitionsButton
        icon={"/img/crafted/thermobaricmissile.png"}
        quantity={96}
      />
      <button className="absolute bottom-4 right-4 text-center h-10 w-24 bg-red-600 hover:bg-red-700 font-bold rounded text-sm">
        Fire
      </button>

      <button className="absolute bottom-4 left-4 text-center h-10 w-24 bg-blue-600 hover:bg-blue-700 font-bold rounded text-sm">
        Back
      </button>
    </div>
  );
}

export default ChooseMunitions;
