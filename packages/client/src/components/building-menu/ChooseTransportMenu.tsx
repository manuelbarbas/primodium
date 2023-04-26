import { useCallback, useEffect } from "react";
import { useMud } from "../../context/MudContext";
import { useSelectedTile } from "../../context/SelectedTileContext";
import PathActionIconButton from "./building-icons/PathActionIconButton";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import { execute } from "../../network/actions";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { systems, providers } = useMud();

  // Set start and end paths for conveyers
  const {
    selectedTile,
    selectedStartPathTile,
    selectedEndPathTile,
    setSelectedStartPathTile,
    setSelectedEndPathTile,
    setShowSelectedPathTiles,
  } = useSelectedTile();

  useEffect(() => {
    // show selected path tiles on mount
    setShowSelectedPathTiles(true);
  }, []);

  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
    setShowSelectedPathTiles(false);
  }, []);

  const startPath = useCallback(() => {
    setSelectedStartPathTile(selectedTile);
  }, [selectedTile]);

  const endPath = useCallback(() => {
    setSelectedEndPathTile(selectedTile);
  }, [selectedTile]);

  const clearPath = useCallback(() => {
    console.log("clearPath");
  }, []);

  // Select tile to end path, executeTyped
  const createPath = useCallback(() => {
    if (selectedStartPathTile !== null && selectedEndPathTile !== null) {
      execute(
        systems["system.BuildPath"].executeTyped(
          {
            x: selectedStartPathTile.x,
            y: selectedStartPathTile.y,
          },
          {
            x: selectedEndPathTile.x,
            y: selectedEndPathTile.y,
          },

          {
            gasLimit: 1_000_000,
          }
        ),
        providers
      );
    }
  }, [selectedStartPathTile, selectedEndPathTile]);

  return (
    <div className="z-[1000] fixed bottom-0 w-11/12 h-72 flex flex-col bg-gray-700 text-white font-mono rounded">
      <p className="mt-4 text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <PathActionIconButton
          backgroundColor="#dd9871"
          text={"Start"}
          action={startPath}
        />
        <PathActionIconButton
          backgroundColor="#77c899"
          text={"End"}
          action={endPath}
        />
        <PathActionIconButton
          backgroundColor="#479dd6"
          text={"Create"}
          action={createPath}
        />
        <PathActionIconButton
          backgroundColor="#ad6b85"
          text={"Clear"}
          action={clearPath}
        />
        <BuildingIconButton label="Node" blockType={BlockType.Node} />
      </div>
      <button
        onClick={closeMenuHelper}
        className="absolute bottom-4 text-center right-0 h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
      >
        <p className="inline-block">Return to menu</p>
      </button>
    </div>
  );
}

export default ChooseTransportMenu;
