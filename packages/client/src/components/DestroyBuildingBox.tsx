import { useCallback } from "react";

import { DisplayTile } from "../util/constants";

import DestroyTileButton from "./DestroyTileButton";

import { useSelectedTile } from "../context/SelectedTileContext";
import { useMud } from "../context/MudContext";

function DestroyBuildingBox() {
  const { systems } = useMud();
  const { selectedTile } = useSelectedTile();

  const destroyTile = useCallback(({ x, y }: DisplayTile) => {
    systems["system.Destroy"].executeTyped(
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 1_000_000,
      }
    );
  }, []);

  // Helpers
  const destroyTileHelper = useCallback(() => {
    destroyTile(selectedTile);
  }, [selectedTile]);

  return (
    <div className="z-[1000] fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className=" mt-4 ml-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Demolish Buildings</p>
        <DestroyTileButton action={destroyTileHelper} />
      </div>
    </div>
  );
}

export default DestroyBuildingBox;
