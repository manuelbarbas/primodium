import { KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { BlockType } from "src/util/constants";
import { Hotbar } from "src/util/types";
import { Hex } from "viem";

const buildingHotbar: Hotbar = {
  name: "Basic Buildings",
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
      blockType: BlockType.IronPlateFactory,
      keybind: KeybindActions.Hotbar4,
    },
    // {
    //   blockType: BlockType.Garage,
    //   keybind: KeybindActions.Hotbar5,
    // },
    // {
    //   blockType: BlockType.Workshop,
    //   keybind: KeybindActions.Hotbar6,
    // },
    {
      blockType: BlockType.StorageUnit,
      keybind: KeybindActions.Hotbar7,
    },
  ],
};

const advancedBuildingHotbar: Hotbar = {
  name: "Advanced Buildings",
  icon: "/img/icons/weaponryicon.png",
  items: [
    {
      blockType: BlockType.PVCellFactory,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: BlockType.SolarPanel,
      keybind: KeybindActions.Hotbar2,
    },
    // {
    //   blockType: BlockType.SAMLauncher,
    //   keybind: KeybindActions.Hotbar3,
    // },
    {
      blockType: BlockType.Hangar,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: BlockType.DroneFactory,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: BlockType.AlloyFactory,
      keybind: KeybindActions.Hotbar6,
    },
    {
      blockType: BlockType.StarmapperStation,
      keybind: KeybindActions.Hotbar7,
    },
  ],
};

export const useHotbarContent = () => {
  const {
    network: { playerEntity },
  } = useMud();
  const [hotbarContent, setHotbarContent] = useState<Hotbar[]>([buildingHotbar]);
  const playerMainbase = components.Home.use(playerEntity)?.mainBase as Entity | undefined;
  const playerLevel = components.Level.use(playerMainbase)?.value ?? 1n;

  const minAdvancedLevel =
    components.P_RequiredBaseLevel.getWithKeys({ prototype: BlockType.PVCellFactory as Hex, level: 1n })?.value ?? 1n;

  useEffect(() => {
    setHotbarContent(
      [buildingHotbar, playerLevel >= minAdvancedLevel ? advancedBuildingHotbar : undefined].filter(Boolean) as Hotbar[]
    );
  }, [playerLevel, minAdvancedLevel]);

  return hotbarContent;
};
