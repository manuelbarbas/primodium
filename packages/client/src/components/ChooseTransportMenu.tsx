import { useCallback } from "react";
import { useSelectedTile } from "../context/SelectedTileContext";
import BuildingButton from "./building-icons/BuildingButton";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
  }, []);

  // Set start and end paths for conveyers
  const { selectedTile, setSelectedStartPathTile, setSelectedEndPathTile } =
    useSelectedTile();

  const startPath = useCallback(() => {
    setSelectedStartPathTile(selectedTile);
  }, [selectedTile]);

  const endPath = useCallback(() => {
    setSelectedEndPathTile(selectedTile);
  }, [selectedTile]);

  const clearPath = useCallback(() => {
    console.log("clearPath");
  }, []);

  return (
    <div className="z-[1000] fixed bottom-0 w-11/12 h-72 flex flex-col bg-gray-700 text-white font-mono rounded">
      <p className="mt-4 text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <BuildingButton
          backgroundColor="red"
          text={"Start Path"}
          action={startPath}
        />
        <BuildingButton
          backgroundColor="green"
          text={"End Path"}
          action={endPath}
        />
        <BuildingButton
          backgroundColor="blue"
          text={"Clear Path"}
          action={clearPath}
        />
        <BuildingButton
          backgroundColor="brown"
          text={"Create Path"}
          action={clearPath}
        />
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
