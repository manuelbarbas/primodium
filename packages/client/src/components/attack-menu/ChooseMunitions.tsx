import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { execute } from "../../network/actions";

import MunitionsButton from "./MunitionsButton";
import { useGameStore } from "../../store/GameStore";

function ChooseMunitions() {
  // executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey)

  const { systems, providers } = useMud();
  const [selectedPathTiles, setTransactionLoading] = useGameStore((state) => [
    state.selectedPathTiles,
    state.setTransactionLoading,
  ]);

  const attackAction = useCallback(async () => {
    if (selectedPathTiles.start !== null && selectedPathTiles.end !== null) {
      setTransactionLoading(true);
      await execute(
        systems["system.Attack"].executeTyped(
          selectedPathTiles.start,
          selectedPathTiles.end,
          0,
          {
            gasLimit: 30_000_000,
          }
        ),
        providers
      );
      setTransactionLoading(false);
    }
  }, [selectedPathTiles]);

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
