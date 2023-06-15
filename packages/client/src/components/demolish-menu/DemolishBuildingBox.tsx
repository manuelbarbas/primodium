import { useCallback } from "react";
import { useGameStore } from "../../store/GameStore";

import { BlockType } from "../../util/constants";

function DemolishBuildingBox() {
  const [selectedBlock, setSelectedBlock] = useGameStore((state) => [
    state.selectedBlock,
    state.setSelectedBlock,
  ]);

  const destroyPath = useCallback(() => {
    setSelectedBlock(BlockType.DemolishPath);
  }, []);

  const destroyTile = useCallback(() => {
    setSelectedBlock(BlockType.DemolishBuilding);
  }, []);

  const resetSetSelectedBlock = useCallback(() => {
    setSelectedBlock(null);
  }, []);

  if (selectedBlock === BlockType.DemolishPath) {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 mx-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Demolish</p>
          <p>Select a Node tile where your path starts to demolish the path.</p>
          <div className="absolute bottom-4 right-4 space-x-2">
            <button
              className="h-10 w-36 bg-orange-600 hover:bg-orange-700 font-bold rounded text-sm"
              onClick={destroyPath}
            >
              <p className="inline-block ml-1">Demolish Path</p>
            </button>
            <button
              className="h-10 w-36 bg-gray-600 hover:bg-gray-700 font-bold rounded text-sm"
              onClick={destroyTile}
            >
              <p className="inline-block ml-1">Demolish</p>
            </button>
          </div>
        </div>
      </div>
    );
  } else if (selectedBlock === BlockType.DemolishBuilding) {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 mx-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Demolish</p>
          <p>Select your building on the map to remove it.</p>
          <div className="absolute bottom-4 right-4 space-x-2">
            <button
              className="h-10 w-36 bg-gray-600 hover:bg-gray-700 font-bold rounded text-sm"
              onClick={destroyPath}
            >
              <p className="inline-block ml-1">Demolish Path</p>
            </button>
            <button
              className="h-10 w-36 bg-red-700 hover:bg-red-800 font-bold rounded text-sm"
              onClick={resetSetSelectedBlock}
            >
              <p className="inline-block ml-1">Demolish</p>
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 mx-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Demolish</p>
          <p>Demolish a tile or path below.</p>
          <div className="absolute bottom-4 right-4 space-x-2">
            <button
              className="h-10 w-36 bg-orange-600 hover:bg-orange-700 font-bold rounded text-sm"
              onClick={destroyPath}
            >
              <p className="inline-block ml-1">Demolish Path</p>
            </button>
            <button
              className="h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
              onClick={destroyTile}
            >
              <p className="inline-block ml-1">Demolish</p>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DemolishBuildingBox;
