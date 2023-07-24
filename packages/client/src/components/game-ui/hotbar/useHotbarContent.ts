import { KeybindActions } from "@game/constants";
import { getComponentValue } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { useMud } from "src/context/MudContext";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { Action, BlockType } from "src/util/constants";
import { Hotbar } from "src/util/types";
import { singletonIndex, world } from "src/network/world";

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
      blockType: BlockType.DebugCopperMine,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: BlockType.DebugLithiumMine,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: BlockType.DebugIronPlateFactory,
      keybind: KeybindActions.Hotbar3,
    },
    {
      blockType: BlockType.DebugStorageBuilding,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: BlockType.DebugSolarPanel,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: BlockType.DebugLithiumCopperOxideFactory,
      keybind: KeybindActions.Hotbar6,
    },
    {
      blockType: BlockType.DebugAlloyFactory,
      keybind: KeybindActions.Hotbar7,
    },
    {
      blockType: BlockType.DebugDemolishBuilding,
      keybind: KeybindActions.Hotbar8,
      action: Action.DemolishBuilding,
    },
    {
      blockType: BlockType.DebugDemolishPath,
      keybind: KeybindActions.Hotbar9,
      action: Action.DemolishPath,
    },
  ],
};

export const useHotbarContent = () => {
  const mainBase = useMainBaseCoord();
  const [hotbarContent, setHotbarContent] = useState<Hotbar[]>([
    mainBase ? buildingHotbar : mainBaseHotbar,
  ]);
  const network = useMud();

  useEffect(() => {
    setHotbarContent(
      [
        mainBase ? buildingHotbar : mainBaseHotbar,
        getComponentValue(
          network.components.IsDebug,
          world.entityToIndex.get(BlockType.IsDebug) ?? singletonIndex
        )
          ? debugHotbar
          : undefined,
      ].filter(Boolean) as Hotbar[]
    );
  }, [mainBase]);

  return hotbarContent;
};
