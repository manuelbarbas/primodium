import { AudioKeys, KeyNames, KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { FaCaretLeft, FaCaretRight, FaLock } from "react-icons/fa";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
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
  const keybinds = useKeybinds();
  const selectedRockEntity = components.ActiveRock.use()?.value;
  const rockMainBase = components.Home.use(selectedRockEntity)?.value;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const mainbaseLevel = components.Level.use(rockMainBase as Entity)?.value ?? 1n;
  const levelRequirement =
    components.P_RequiredBaseLevel.getWithKeys({ prototype: buildingType as Hex, level: 1n })?.value ?? 1n;
  const hasMainbaseLevel = mainbaseLevel >= levelRequirement;

  const hasEnough = useHasEnoughResources(getRecipe(buildingType, 1n));

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
      className={`relative btn-ghost min-h-9 ! p-0 ${
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
      {keybindActive && (
        <p className="absolute bottom-1 left-0 flex text-xs kbd kbd-xs">
          {KeyNames[keybinds[keybind ?? KeybindActions.NULL]?.entries().next().value[0]] ?? "?"}
        </p>
      )}
    </Button>
  );
};

export const AllBlueprints = () => {
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="p-2 flex flex-col gap-1 items-start">
        <div className={`p-1 flex flex-col gap-6 items-center w-full ${index === 0 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-success">BASIC</p>
          </div>
          <div className="grid grid-cols-4 gap-1 w-full">
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.IronMine}
              keybind={KeybindActions.Hotbar0}
              keybindActive={index === 0}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.CopperMine}
              keybind={KeybindActions.Hotbar1}
              keybindActive={index === 0}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.LithiumMine}
              keybind={KeybindActions.Hotbar2}
              keybindActive={index === 0}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Garage}
              keybind={KeybindActions.Hotbar3}
              keybindActive={index === 0}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Workshop}
              keybind={KeybindActions.Hotbar4}
              keybindActive={index === 0}
            />
          </div>
        </div>

        <div className={`flex flex-col gap-6 w-full items-center p-1 ${index === 1 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-info">ADVANCED</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full">
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.StorageUnit}
              keybind={KeybindActions.Hotbar0}
              keybindActive={index === 1}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.SolarPanel}
              keybind={KeybindActions.Hotbar1}
              keybindActive={index === 1}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.DroneFactory}
              keybind={KeybindActions.Hotbar2}
              keybindActive={index === 1}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.IronPlateFactory}
              keybind={KeybindActions.Hotbar3}
              keybindActive={index === 1}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.PVCellFactory}
              keybind={KeybindActions.Hotbar4}
              keybindActive={index === 1}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Vault}
              keybind={KeybindActions.Hotbar5}
              keybindActive={index === 1}
            />
          </div>
        </div>

        <div className={`flex flex-col gap-6 w-full items-center p-1 ${index === 2 ? " bg-success/10" : ""}`}>
          <div className="flex border-b border-secondary justify-between w-full">
            <p className="text-xs opacity-75 font-bold text-warning">ELITE</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full">
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.SAMLauncher}
              keybind={KeybindActions.Hotbar0}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Hangar}
              keybind={KeybindActions.Hotbar1}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.AlloyFactory}
              keybind={KeybindActions.Hotbar2}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.StarmapperStation}
              keybind={KeybindActions.Hotbar3}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.ShieldGenerator}
              keybind={KeybindActions.Hotbar4}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Market}
              keybind={KeybindActions.Hotbar5}
              keybindActive={index === 2}
            />
            <BlueprintButton
              tooltipDirection="top"
              buildingType={EntityType.Shipyard}
              keybind={KeybindActions.Hotbar6}
              keybindActive={index === 2}
            />
          </div>
        </div>
      </div>

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
    </>
  );
};
