import { useCallback } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";

function ChooseFactoryMenu({
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
    <div className="z-[1000] fixed bottom-0 w-11/12 h-72 flex flex-col bg-gray-700 text-white font-mono rounded">
      <p className="mt-4 text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <BuildingIconButton
          label="Plating factory"
          blockType={BlockType.PlatingFactory}
        />
        <BuildingIconButton
          label="Basic battery factory"
          blockType={BlockType.BasicBatteryFactory}
        />
        <BuildingIconButton
          label="Dense metal refinery"
          blockType={BlockType.DenseMetalRefinery}
        />
        <BuildingIconButton
          label="Advanced battery factory"
          blockType={BlockType.AdvancedBatteryFactory}
        />
        <BuildingIconButton
          label="High temp foundry"
          blockType={BlockType.HighTempFoundry}
        />
        <BuildingIconButton
          label="Precision machinery factory"
          blockType={BlockType.PrecisionMachineryFactory}
        />
        <BuildingIconButton
          label="Iridium drillbit factory"
          blockType={BlockType.IridiumDrillbitFactory}
        />
        <BuildingIconButton
          label="High-energy laser factory"
          blockType={BlockType.HighEnergyLaserFactory}
        />
        <BuildingIconButton
          label="Kimberlite catalyst factory"
          blockType={BlockType.KimberliteCatalystFactory}
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

export default ChooseFactoryMenu;
