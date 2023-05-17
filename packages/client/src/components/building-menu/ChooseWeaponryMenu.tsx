import { useCallback } from "react";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import BuildingContentBox from "./BuildingBox";

function ChooseWeaponryMenu({
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
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        <BuildingIconButton
          label="Kinetic missile factory"
          blockType={BlockType.KineticMissileFactory}
        />
        <BuildingIconButton
          label="Projectile launcher"
          blockType={BlockType.ProjectileLauncher}
        />
        <BuildingIconButton
          label="Penetrator factory"
          blockType={BlockType.PenetratorFactory}
        />
        <BuildingIconButton
          label="Penetrating missile factory"
          blockType={BlockType.PenetratingMissileFactory}
        />
        <BuildingIconButton
          label="Missile launch complex"
          blockType={BlockType.MissileLaunchComplex}
        />
        <BuildingIconButton
          label="Thermobaric warhead factory"
          blockType={BlockType.ThermobaricWarheadFactory}
        />
        <BuildingIconButton
          label="Thermobaric missile factory"
          blockType={BlockType.ThermobaricMissileFactory}
        />
      </div>
      <button
        onClick={closeMenuHelper}
        className="absolute bottom-4 text-center right-4 h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
      >
        <p className="inline-block">Return to menu</p>
      </button>
    </BuildingContentBox>
  );
}

export default ChooseWeaponryMenu;
