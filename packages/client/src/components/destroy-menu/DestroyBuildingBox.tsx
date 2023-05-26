import { useGameStore } from "../../store/GameStore";

import { BlockType } from "../../util/constants";

function DestroyBuildingBox() {
  const [setSelectedBlock] = useGameStore((state) => [state.setSelectedBlock]);

  const destroyPath = () => {
    setSelectedBlock(BlockType.DemolishPath);
  };

  const destroyTile = () => {
    setSelectedBlock(BlockType.DemolishBuilding);
  };

  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className="mt-4 mx-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Demolish</p>
        <p>
          Select your building/path on the map and click <i>Demolish</i> to
          remove it.
        </p>
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

export default DestroyBuildingBox;
