import { useCallback } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";

function ChooseDebugMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
  }, []);

  return (
    /* the images for the building icon buttons here work because they reference the debug building types,
    rather than the actual building type. see constants.ts for reference on why the Node image shows up
    here but not on the transport menu */
    <div className="z-[1000] fixed bottom-0 w-11/12 h-72 flex flex-col bg-gray-700 text-white font-mono rounded">
      <p className="mt-4 text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <BuildingIconButton label="Miner" blockType={BlockType.Miner} />
        <BuildingIconButton label="Node" blockType={BlockType.Conveyor} />
        <BuildingIconButton label="Base" blockType={BlockType.MainBase} />
        <BuildingIconButton label="BulF" blockType={BlockType.BulletFactory} />
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

export default ChooseDebugMenu;
