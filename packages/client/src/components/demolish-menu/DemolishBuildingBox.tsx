import { Action } from "../../util/constants";
import { SelectedAction } from "src/network/components/clientComponents";

function DemolishBuildingBox() {
  const selectedAction = SelectedAction.use()?.value;
  const destroyPath = () => {
    SelectedAction.set({ value: Action.DemolishPath });
  };

  const destroyTile = () => {
    SelectedAction.set({ value: Action.DemolishBuilding });
  };

  const resetSetSelectedBlock = () => {
    SelectedAction.remove();
  };

  if (selectedAction === Action.DemolishPath) {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 mx-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Demolishing Path</p>
          <p>Select a node where your path starts to demolish the path.</p>
          <div className="absolute bottom-4 right-4 space-x-2">
            <button
              className="h-10 w-36 bg-orange-700 hover:bg-orange-800 font-bold rounded text-sm"
              onClick={resetSetSelectedBlock}
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
  } else if (selectedAction === Action.DemolishBuilding) {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className="mt-4 mx-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Demolishing Building</p>
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
          <p>Select an option below.</p>
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
