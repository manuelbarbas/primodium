import { primodium } from "@game/api";
import { useComponentValue } from "@latticexyz/react";
import { removeComponent } from "@latticexyz/recs";
import { useMud } from "src/context/MudContext";
import { singletonIndex } from "src/network/world";
import { Action, BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";
import BuildingIconButton from "./building-icons/BuildingIconButton";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const network = useMud();
  const selectedAction = useComponentValue(
    network.offChainComponents.SelectedAction,
    singletonIndex
  )?.value;
  const startSelectedPath = primodium.hooks.useStartSelectedPath(network);

  const closeMenuHelper = () => {
    setMenuOpenIndex(-1);
    removeComponent(network.offChainComponents.SelectedAction, singletonIndex);
  };

  const clearPath = () => {
    removeComponent(network.offChainComponents.SelectedAction, singletonIndex);
    //system will clean up relavant components data
  };

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      {selectedAction === Action.Conveyor && (
        <div className="mr-4">
          {!startSelectedPath && (
            <p>
              <i>Start</i> a path by clicking on a Node to send resources.
            </p>
          )}
          {/* player placed start and conveyor selection is still active */}
          {startSelectedPath && selectedAction == Action.Conveyor && (
            <p>
              <i>End</i> a path by clicking on a Node to receive resources from.
            </p>
          )}
        </div>
      )}

      {selectedAction !== Action.Conveyor && !startSelectedPath && (
        <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
          <BuildingIconButton
            id="conveyor"
            label="Conveyor"
            blockType={BlockType.Conveyor}
          />
        </div>
      )}

      <div className="absolute bottom-4 right-4 space-x-2">
        {selectedAction === Action.Conveyor && (
          <button
            onClick={clearPath}
            className="text-center h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
          >
            <p className="inline-block">Clear</p>
          </button>
        )}
        {selectedAction !== Action.Conveyor && (
          <button
            onClick={closeMenuHelper}
            className="bottom-4 text-center h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
          >
            <p className="inline-block">Other Buildings</p>
          </button>
        )}
      </div>
    </BuildingContentBox>
  );
}

export default ChooseTransportMenu;
