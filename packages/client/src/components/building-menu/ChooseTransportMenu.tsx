import { useCallback } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";
import { primodium } from "@game/api";
import { useMud } from "src/context/MudContext";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const network = useMud();
  const selectedBuilding = primodium.hooks.useSelectedBuilding(network);
  const startSelectedPath = primodium.hooks.useStartSelectedPath(network);

  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
    primodium.components.selectedBuilding(network).remove();
    // primodium.components.startSelectedPath(network).remove();
  }, [network]);

  const clearPath = useCallback(() => {
    //system will clean up relavant components data
    primodium.components.selectedBuilding(network).remove();
  }, [network]);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      {selectedBuilding === BlockType.Conveyor && (
        <div className="mr-4">
          {!startSelectedPath && (
            <p>
              <i>Start</i> a path by clicking on a Node to send resources.
            </p>
          )}
          {/* player placed start and conveyor selection is still active */}
          {startSelectedPath && selectedBuilding == BlockType.Conveyor && (
            <p>
              <i>End</i> a path by clicking on a Node to receive resources from.
            </p>
          )}
        </div>
      )}

      {selectedBuilding !== BlockType.Conveyor && (
        <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
          <BuildingIconButton
            id="conveyor"
            label="Conveyor"
            blockType={BlockType.Conveyor}
          />
        </div>
      )}

      <div className="absolute bottom-4 right-4 space-x-2">
        {selectedBuilding === BlockType.Conveyor && (
          <button
            onClick={clearPath}
            className="text-center h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
          >
            <p className="inline-block">Clear</p>
          </button>
        )}
        {selectedBuilding !== BlockType.Conveyor && (
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
