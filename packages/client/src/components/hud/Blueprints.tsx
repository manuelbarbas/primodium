import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaCaretLeft, FaCaretRight, FaLock } from "react-icons/fa";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";
import { Button } from "../core/Button";
import { Card, SecondaryCard } from "../core/Card";
import { BuildingImageFromType } from "../shared/BuildingImage";
import { BlueprintInfo } from "./BlueprintInfo";
import { AudioKeys, KeyNames, KeybindActions } from "@game/constants";
import { useState } from "react";
import { primodium } from "@game/api";

const Blueprint: React.FC<{
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
  keybind?: KeybindActions;
  keybindActive?: boolean;
}> = ({ buildingType, tooltipDirection, keybind, keybindActive = false }) => {
  const {
    hooks: { useKeybinds },
  } = primodium.api()!;
  const keybinds = useKeybinds();
  const player = components.Account.use()?.value ?? singletonEntity;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const mainbaseLevel =
    components.Level.use((components.Home.use(player)?.mainBase ?? singletonEntity) as Entity)?.value ?? 1n;
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
      className={`relative btn-ghost w-fit p-0 ${
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-error flex text-xs bg">
          <p className="bg-neutral flex gap-1">
            <FaLock /> LVL. {levelRequirement.toString()}
          </p>
        </div>
      )}
      {keybindActive && (
        <p className="absolute bottom-1 left-0 text-accent flex text-xs kbd kbd-xs">
          {KeyNames[keybinds[keybind ?? KeybindActions.NULL]?.entries().next().value[0]] ?? "?"}
        </p>
      )}
    </Button>
  );
};

export const Blueprints = () => {
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className="flex h-fit w-full gap-1 items-start">
        <SecondaryCard className={`gap-2 items-center ${index === 0 ? "!border-success/75" : ""}`}>
          <p className="text-xs opacity-50 font-bold pb-2">BASIC</p>
          <Blueprint buildingType={EntityType.IronMine} keybind={KeybindActions.Hotbar0} keybindActive={index === 0} />
          <Blueprint
            buildingType={EntityType.CopperMine}
            keybind={KeybindActions.Hotbar1}
            keybindActive={index === 0}
          />
          <Blueprint
            buildingType={EntityType.LithiumMine}
            keybind={KeybindActions.Hotbar2}
            keybindActive={index === 0}
          />
          <Blueprint
            buildingType={EntityType.SulfurMine}
            keybind={KeybindActions.Hotbar3}
            keybindActive={index === 0}
          />
          <Blueprint buildingType={EntityType.Garage} keybind={KeybindActions.Hotbar4} keybindActive={index === 0} />
          <Blueprint buildingType={EntityType.Workshop} keybind={KeybindActions.Hotbar5} keybindActive={index === 0} />
        </SecondaryCard>
        <SecondaryCard className={`gap-2 items-center ${index === 1 ? "!border-success/75" : ""}`}>
          <p className="text-xs opacity-50 font-bold pb-2">ADVANCED</p>
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.StorageUnit}
            keybind={KeybindActions.Hotbar0}
            keybindActive={index === 1}
          />
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.SolarPanel}
            keybind={KeybindActions.Hotbar1}
            keybindActive={index === 1}
          />
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.DroneFactory}
            keybind={KeybindActions.Hotbar2}
            keybindActive={index === 1}
          />
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.IronPlateFactory}
            keybind={KeybindActions.Hotbar3}
            keybindActive={index === 1}
          />
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.PVCellFactory}
            keybind={KeybindActions.Hotbar4}
            keybindActive={index === 1}
          />
          <Blueprint
            tooltipDirection="top"
            buildingType={EntityType.Vault}
            keybind={KeybindActions.Hotbar5}
            keybindActive={index === 1}
          />
        </SecondaryCard>
        <SecondaryCard className={`gap-2 items-center ${index === 2 ? "!border-success/75" : ""}`}>
          <p className="text-xs opacity-50 font-bold pb-2">ELITE</p>
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.SAMLauncher}
            keybind={KeybindActions.Hotbar0}
            keybindActive={index === 2}
          />
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.Hangar}
            keybind={KeybindActions.Hotbar1}
            keybindActive={index === 2}
          />
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.AlloyFactory}
            keybind={KeybindActions.Hotbar2}
            keybindActive={index === 2}
          />
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.StarmapperStation}
            keybind={KeybindActions.Hotbar3}
            keybindActive={index === 2}
          />
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.ShieldGenerator}
            keybind={KeybindActions.Hotbar4}
            keybindActive={index === 2}
          />
          <Blueprint
            tooltipDirection="left"
            buildingType={EntityType.Market}
            keybind={KeybindActions.Hotbar5}
            keybindActive={index === 2}
          />
        </SecondaryCard>
      </div>
      <div className="w-full flex justify-center gap-1 pt-2">
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
      {selectedBuilding && (
        <Card className="absolute card top-0 left-0 -translate-y-full w-full -translate-x-[1px] border-r-0 py-1">
          <BlueprintInfo building={selectedBuilding} />
        </Card>
      )}
    </>
  );
};
