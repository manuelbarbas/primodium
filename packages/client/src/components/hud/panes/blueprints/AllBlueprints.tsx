import { AudioKeys, KeyNames, KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useMemo, useState } from "react";
import { FaCaretLeft, FaCaretRight, FaLock } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../../../core/Button";
import { BuildingImageFromType } from "../../../shared/BuildingImage";

const BlueprintButton: React.FC<{
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
  keybind?: KeybindActions;
  keybindActive?: boolean;
}> = ({ buildingType, tooltipDirection, keybind, keybindActive = false }) => {
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
      tooltip={getBlockTypeName(buildingType)}
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
      className={`relative btn-ghost min-h-9 p-0 ${
        hasMainbaseLevel
          ? hasEnough
            ? "hover:bg-accent border-accent/50"
            : "hover:bg-warning border-warning/75"
          : "hover:bg-error border-error/75"
      } disabled:opacity-50 border border-secondary hover:z-10 ${
        selectedBuilding === buildingType ? " ring-2 ring-white/75" : ""
      }`}
    >
      <BuildingImageFromType buildingType={buildingType} />
      {!hasMainbaseLevel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-error flex text-[.6rem] bg">
          <p className="bg-neutral flex gap-1">
            <FaLock /> LVL. {levelRequirement.toString()}
          </p>
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

export const AllBlueprints = () => {
  const [index, setIndex] = useState(0);

  const [hideHotkeys] = usePersistentStore(useShallow((state) => [state.hideHotkeys]));
  const selectedRockEntity = components.ActiveRock.use()?.value;
  const mapId = components.Asteroid.use(selectedRockEntity)?.mapId;
  const basicBuildings = useMemo(() => {
    let mines: Entity[] = [];
    if (mapId === 1) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
    else if (mapId === 2) mines = [EntityType.KimberliteMine];
    else if (mapId === 3) mines = [EntityType.IridiumMine];
    else if (mapId === 4) mines = [EntityType.PlatinumMine];
    else if (mapId === 5) mines = [EntityType.TitaniumMine];
    return [...mines, EntityType.Garage, EntityType.Workshop];
  }, [mapId]);

  const advancedBuildings = [
    EntityType.SolarPanel,
    EntityType.StorageUnit,
    EntityType.DroneFactory,
    EntityType.IronPlateFactory,
    EntityType.PVCellFactory,
    EntityType.Vault,
  ];
  const eliteBuildings = [
    EntityType.SAMLauncher,
    EntityType.Hangar,
    EntityType.AlloyFactory,
    EntityType.StarmapperStation,
    EntityType.ShieldGenerator,
    EntityType.Market,
    EntityType.Shipyard,
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
  return (
    <>
      <div className="p-2 flex flex-col gap-1 items-start">
        <div className={`p-1 flex flex-col gap-6 items-center w-full ${index === 0 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-success">BASIC</p>
          </div>
          <div className="grid grid-cols-4 gap-1 w-full">
            {basicBuildings.map((buildingType, i) => (
              <BlueprintButton
                key={i}
                tooltipDirection="top"
                buildingType={buildingType}
                keybind={keybinds[i]}
                keybindActive={index === 0}
              />
            ))}
          </div>
        </div>

        <div className={`flex flex-col gap-6 w-full items-center p-1 ${index === 1 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-info">ADVANCED</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full">
            {advancedBuildings.map((buildingType, i) => (
              <BlueprintButton
                key={i}
                tooltipDirection="top"
                buildingType={buildingType}
                keybind={keybinds[i]}
                keybindActive={index === 1}
              />
            ))}
          </div>
        </div>

        <div className={`flex flex-col gap-6 w-full items-center p-1 ${index === 2 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-warning">ELITE</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full">
            {eliteBuildings.map((buildingType, i) => (
              <BlueprintButton
                key={i}
                tooltipDirection="top"
                buildingType={buildingType}
                keybind={keybinds[i]}
                keybindActive={index === 2}
              />
            ))}
          </div>
        </div>
      </div>

      {!hideHotkeys && (
        <div className="w-full flex justify-center gap-1 py-2">
          <Button
            className="btn-xs btn-ghost"
            keybind={KeybindActions.PrevHotbar}
            onClick={() => {
              setIndex((index) => (index + 2) % 3);
            }}
            clickSound={AudioKeys.Click}
          >
            <p className="kbd kbd-xs">
              Q<FaCaretLeft />
            </p>
          </Button>
          <Button
            className="btn-xs btn-ghost"
            keybind={KeybindActions.NextHotbar}
            onClick={() => {
              setIndex((index) => (index + 1) % 3);
            }}
            clickSound={AudioKeys.Click}
          >
            <p className="kbd kbd-xs">
              <FaCaretRight />E
            </p>
          </Button>
        </div>
      )}
    </>
  );
};
