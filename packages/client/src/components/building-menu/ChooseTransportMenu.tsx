import { useCallback, useEffect } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";
import { useGameStore } from "../../store/GameStore";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [
    selectedPathTiles,
    setShowSelectedPathTiles,
    setStartSelectedPathTile,
    setEndSelectedPathTile,
    selectedBlock,
    setSelectedBlock,
  ] = useGameStore((state) => [
    state.selectedPathTiles,
    state.setShowSelectedPathTiles,
    state.setStartSelectedPathTile,
    state.setEndSelectedPathTile,
    state.selectedBlock,
    state.setSelectedBlock,
  ]);

  useEffect(() => {
    // show selected path tiles on mount
    setShowSelectedPathTiles(true);
  }, []);

  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
    setShowSelectedPathTiles(false);
    setSelectedBlock(null);
  }, []);

  const clearPath = useCallback(() => {
    setStartSelectedPathTile(null);
    setEndSelectedPathTile(null);
    setSelectedBlock(null);
  }, [setStartSelectedPathTile, setEndSelectedPathTile]);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      {selectedBlock === BlockType.Conveyor && (
        <div className="mr-4">
          {selectedPathTiles.start === null && (
            <p>
              <i>Start</i> a path by clicking on a Node to send resources.
            </p>
          )}
          {/* player placed start and conveyer selection is still active */}
          {selectedPathTiles.start !== null &&
            selectedBlock == BlockType.Conveyor && (
              <p>
                <i>End</i> a path by clicking on a Node to receive resources
                from.
              </p>
            )}
        </div>
      )}

      {selectedBlock !== BlockType.Conveyor &&
        selectedPathTiles.start === null && (
          <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
            <BuildingIconButton label="Node" blockType={BlockType.Node} />
            <BuildingIconButton
              label="Conveyor"
              blockType={BlockType.Conveyor}
            />
          </div>
        )}

      <div className="absolute bottom-4 right-4 space-x-2">
        {selectedBlock === BlockType.Conveyor && (
          <button
            onClick={clearPath}
            className="text-center h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
          >
            <p className="inline-block">Clear</p>
          </button>
        )}
        {selectedBlock !== BlockType.Conveyor && (
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
