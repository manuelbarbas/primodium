import { useCallback } from "react";

// import { useSelectedTile } from "../../context/SelectedTileContext";
import { useMud } from "../../context/MudContext";
// import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import { useGameStore } from "../../store/GameStore";

import { execute } from "../../network/actions";
import { DisplayTile } from "../../util/constants";

import DestroyTileButton from "./DestroyTileButton";

function DestroyBuildingBox() {
  const { systems, providers } = useMud();
  // const { selectedTile } = useSelectedTile();
  // const { setTransactionLoading } = useTransactionLoading();
  const [selectedTile, setTransactionLoading] = useGameStore((state) => [
    state.selectedTile,
    state.setTransactionLoading,
  ]);

  const destroyTile = useCallback(async ({ x, y }: DisplayTile) => {
    setTransactionLoading(true);
    await execute(
      systems["system.Destroy"].executeTyped(
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 1_000_000,
        }
      ),
      providers
    );
    setTransactionLoading(false);
  }, []);

  // Helpers
  const destroyTileHelper = useCallback(() => {
    destroyTile(selectedTile);
  }, [selectedTile]);

  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className="mt-4 mx-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Demolish</p>
        <p>
          Select your building on the map and click <i>Demolish</i> to remove
          it.
        </p>
        <DestroyTileButton action={destroyTileHelper} />
      </div>
    </div>
  );
}

export default DestroyBuildingBox;
