import { AudioKeys, KeyNames, KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useMemo, useState } from "react";
import { FaCaretLeft, FaCaretRight, FaLock } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getEntityTypeName } from "src/util/common";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
import { Button } from "../../../core/Button";
import { BuildingImageFromType } from "../../../shared/BuildingImage";
import { useShallow } from "zustand/react/shallow";

const BlueprintButton: React.FC<{
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
  keybind?: KeybindActions;
  keybindActive?: boolean;
  className?: string;
}> = ({ buildingType, tooltipDirection, keybind, keybindActive = false, className }) => {
  const {
    hooks: { useKeybinds },
  } = usePrimodium().api();

  const [hideHotkeys] = usePersistentStore(useShallow((state) => [state.hideHotkeys]));
  const keybinds = useKeybinds();
  const selectedRockEntity = components.ActiveRock.use()?.value as Entity | undefined;
  if (!selectedRockEntity) throw new Error("No active rock entity found");
  const rockMainBase = components.Home.use(selectedRockEntity)?.value;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const mainbaseLevel = components.Level.use(rockMainBase as Entity)?.value ?? 1n;
  const levelRequirement =
    components.P_RequiredBaseLevel.getWithKeys({ prototype: buildingType as Hex, level: 1n })?.value ?? 1n;
  const hasMainbaseLevel = mainbaseLevel >= levelRequirement;

  const hasEnough = useHasEnoughResources(getRecipe(buildingType, 1n), selectedRockEntity);

  return (
    <Button
      disabled={mainbaseLevel < levelRequirement}
      tooltip={getEntityTypeName(buildingType)}
      keybind={keybindActive ? keybind : undefined}
      tooltipDirection={tooltipDirection ?? "right"}
      onPointerEnter={() => components.HoverEntity.set({ value: buildingType })}
      onPointerLeave={() => components.HoverEntity.remove()}
      clickSound={AudioKeys.Bleep7}
      onClick={() => {
        if (selectedBuilding === buildingType) {
          components.SelectedBuilding.remove();
          components.SelectedAction.remove();
          return;
        }
        components.SelectedBuilding.set({ value: buildingType });
        components.SelectedAction.set({ value: Action.PlaceBuilding });
      }}
      className={`min-h-[3.6rem] bg-base-200 ${
        hasMainbaseLevel
          ? hasEnough
            ? "hover:bg-accent border-accent/25"
            : "hover:bg-warning border-warning/75"
          : "hover:bg-error border-error/25"
      } disabled:opacity-50 border border-secondary hover:z-10 ${
        selectedBuilding === buildingType ? " ring-2 ring-white/75" : ""
      } relative btn-ghost min-h-11 max-h-12 p-0 text-[2.5rem] !bg-info/25 ${className}`}
    >
      <BuildingImageFromType buildingType={buildingType} />
      {!hasMainbaseLevel && (
        <div className="absolute top-0 w-full h-full gap-1 flex items-center justify-center text-[.5rem] bg-neutral/50">
          <span className="h-3 flex items-center justify-center gap-1 text-white bg-gray-800/50 z-30">
            <FaLock />
            <p>Level {levelRequirement.toString()}</p>
          </span>
        </div>
      )}
      {!hideHotkeys && keybindActive && (
        <p className="absolute bottom-1 left-0 flex text-xs kbd kbd-xs">
          {KeyNames[keybinds[keybind ?? KeybindActions.NULL]?.entries().next().value[0]] ?? "?"}
        </p>
      )}
    </Button>
  );
};

//Buildings
type BuildingBlueprintsProps = {
  buildingTypeToShow: number;
};

export const BuildingBlueprints: React.FC<BuildingBlueprintsProps> = ({ buildingTypeToShow }) => {
  const [index, setIndex] = useState(0);

  const [hideHotkeys] = usePersistentStore((state) => [state.hideHotkeys]);
  const selectedRockEntity = components.ActiveRock.use()?.value;
  const mapId = components.Asteroid.use(selectedRockEntity)?.mapId;

  const productionBuildings = useMemo(() => {
    let mines: Entity[] = [];
    if (mapId === 1) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
    else if (mapId === 2) mines = [EntityType.KimberliteMine];
    else if (mapId === 3) mines = [EntityType.IridiumMine];
    else if (mapId === 4) mines = [EntityType.PlatinumMine];
    else if (mapId === 5) mines = [EntityType.TitaniumMine];
    return [
      ...mines,
      EntityType.IronPlateFactory,
      EntityType.PVCellFactory,
      EntityType.AlloyFactory,
      EntityType.SolarPanel,
    ];
  }, [mapId]);

  const storageBuildings = [
    EntityType.Garage, 
    EntityType.StorageUnit, 
    EntityType.Hangar, 
    EntityType.Vault
  ];

  const militaryBuildings = [
    EntityType.Workshop,
    EntityType.SAMLauncher,
    EntityType.DroneFactory,
    EntityType.ShieldGenerator,
    EntityType.Shipyard,
  ];

  const infrastructureBuildings = [
    EntityType.StarmapperStation, 
    EntityType.Market
  ];

  const keybinds = [
    KeybindActions.Hotbar0,
    KeybindActions.Hotbar1,
    KeybindActions.Hotbar2,
    KeybindActions.Hotbar3,
    KeybindActions.Hotbar4,
    KeybindActions.Hotbar5,
    KeybindActions.Hotbar6,
  ];

  // Decide which buildings to show based on the buildingTypeToShow prop
  let buildingsToShow = [];
  switch (buildingTypeToShow) {
    case 0:
      buildingsToShow = productionBuildings;
      break;
    case 1:
      buildingsToShow = militaryBuildings;
      break;
    case 2:
      buildingsToShow = storageBuildings;
      break;
    case 3:
      buildingsToShow = infrastructureBuildings;
      break;
    default:
      buildingsToShow = [];
  }

  return (
    <>
      <div className="flex flex-col gap-1 items-start">
        <div className={` flex flex-col gap-1 items-center w-full `}>
          <div className="grid grid-cols-3 gap-1 w-60 p-1">
            {buildingsToShow.map((buildingType, i) => (
              <BlueprintButton key={i} tooltipDirection="top" buildingType={buildingType} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
