import { Action, BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import {
  SelectedAction,
  StartSelectedPath,
} from "src/network/components/clientComponents";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const selectedAction = SelectedAction.use()?.value;
  const startSelectedPath = StartSelectedPath.use();

  const closeMenuHelper = () => {
    setMenuOpenIndex(-1);
    SelectedAction.remove();
  };

  const clearPath = () => {
    SelectedAction.remove();
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
