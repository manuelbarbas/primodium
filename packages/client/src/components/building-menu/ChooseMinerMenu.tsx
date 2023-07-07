import { useCallback } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";
import { useGameStore } from "../../store/GameStore";

function ChooseMinerMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [setSelectedBlock] = useGameStore((state) => [state.setSelectedBlock]);

  const closeMenuHelper = useCallback(() => {
    setSelectedBlock(null);
    setMenuOpenIndex(-1);
  }, []);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <BuildingIconButton
          id="iron-mine"
          label="Iron Mine"
          blockType={BlockType.IronMine}
        />
        <BuildingIconButton
          id="copper-mine"
          label="Copper Mine"
          blockType={BlockType.CopperMine}
        />
        <BuildingIconButton
          id="lithium-mine"
          label="Lithium Mine"
          blockType={BlockType.CopperMine}
        />
        <BuildingIconButton
          label="Hardened drill"
          blockType={BlockType.HardenedDrill}
        />
        <BuildingIconButton
          label="Precision pneumatic drill"
          blockType={BlockType.PrecisionPneumaticDrill}
        />
      </div>
      <button
        onClick={closeMenuHelper}
        className="absolute bottom-4 text-center right-4 h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
      >
        <p className="inline-block">Other Buildings</p>
      </button>
    </BuildingContentBox>
  );
}

export default ChooseMinerMenu;
