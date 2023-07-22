import { KeybindActions } from "@game/constants";
import { useEffect, useState } from "react";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { Action, BlockType } from "src/util/constants";
import { Hotbar } from "src/util/types";

const mainBaseHotbar: Hotbar = {
  name: "Main Base",
  icon: "/img/icons/mainbaseicon.png",
  items: [
    {
      blockType: BlockType.MainBase,
      keybind: KeybindActions.Hotbar0,
    },
  ],
};

const buildingHotbar: Hotbar = {
  name: "Buildings",
  icon: "/img/icons/minersicon.png",
  items: [
    {
      blockType: BlockType.IronMine,
      keybind: KeybindActions.Hotbar0,
    },
    {
      blockType: BlockType.CopperMine,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: BlockType.LithiumMine,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: BlockType.Conveyor,
      keybind: KeybindActions.Hotbar3,
      action: Action.Conveyor,
    },
    {
      blockType: BlockType.StorageUnit,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: BlockType.IronPlateFactory,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: BlockType.IronPlateFactory,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: BlockType.AlloyFactory,
      keybind: KeybindActions.Hotbar6,
    },
    {
      blockType: BlockType.PhotovoltaicCellFactory,
      keybind: KeybindActions.Hotbar7,
    },
    {
      blockType: BlockType.SolarPanel,
      keybind: KeybindActions.Hotbar8,
    },
  ],
};

const debugHotbar: Hotbar = {
  name: "Debug",
  icon: "/img/icons/debugicon.png",
  items: [
    {
      blockType: BlockType.DebugIronMine,
      keybind: KeybindActions.Hotbar0,
    },
    {
      blockType: BlockType.DebugIronPlateFactory,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: BlockType.DebugStorageBuilding,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: BlockType.DebugDemolishBuilding,
      keybind: KeybindActions.Hotbar3,
      action: Action.DemolishBuilding,
    },
    {
      blockType: BlockType.DebugDemolishPath,
      keybind: KeybindActions.Hotbar4,
      action: Action.DemolishPath,
    },
  ],
};

export const useHotbarContent = () => {
  const mainBase = useMainBaseCoord();
  const [hotbarContent, setHotbarContent] = useState<Hotbar[]>([
    mainBase ? buildingHotbar : mainBaseHotbar,
  ]);

  useEffect(() => {
    setHotbarContent(
      [
        mainBase ? buildingHotbar : mainBaseHotbar,
        import.meta.env.VITE_DEV === "true" ? debugHotbar : undefined,
      ].filter(Boolean) as Hotbar[]
    );
  }, [mainBase]);

  return hotbarContent;
};
