import { KeybindActions } from "@game/constants";
import { useEffect, useState } from "react";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { BlockType } from "src/util/constants";
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
      blockType: BlockType.SulfurMine,
      keybind: KeybindActions.Hotbar3,
    },
    {
      blockType: BlockType.StorageUnit,
      keybind: KeybindActions.Hotbar5,
    },
  ],
};

const advancedBuildingHotbar: Hotbar = {
  name: "Advanced Buildings",
  icon: "/img/icons/weaponryicon.png",
  items: [
    {
      blockType: BlockType.IronPlateFactory,
      keybind: KeybindActions.Hotbar0,
    },
    {
      blockType: BlockType.AlloyFactory,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: BlockType.PhotovoltaicCellFactory,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: BlockType.SolarPanel,
      keybind: KeybindActions.Hotbar3,
    },
    {
      blockType: BlockType.StarmapperStation,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: BlockType.DroneFactory,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: BlockType.Hangar,
      keybind: KeybindActions.Hotbar6,
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
        buildingHotbar,
        advancedBuildingHotbar,
        // IsDebug.get() ? debugHotbar : undefined,
      ].filter(Boolean) as Hotbar[]
    );
  }, [mainBase]);

  return hotbarContent;
};
