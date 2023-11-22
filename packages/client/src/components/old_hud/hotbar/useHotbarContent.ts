import { KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { Hotbar } from "src/util/types";
import { Hex } from "viem";

const buildingHotbar: Hotbar = {
  name: "Basic Buildings",
  icon: "/img/icons/minersicon.png",
  items: [
    {
      blockType: EntityType.IronMine,
      keybind: KeybindActions.Hotbar0,
    },
    {
      blockType: EntityType.CopperMine,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: EntityType.LithiumMine,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: EntityType.SulfurMine,
      keybind: KeybindActions.Hotbar3,
    },
    {
      blockType: EntityType.IronPlateFactory,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: EntityType.Garage,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: EntityType.Workshop,
      keybind: KeybindActions.Hotbar6,
    },
    {
      blockType: EntityType.StorageUnit,
      keybind: KeybindActions.Hotbar7,
    },
  ],
};

const advancedBuildingHotbar: Hotbar = {
  name: "Advanced Buildings",
  icon: "/img/icons/weaponryicon.png",
  items: [
    {
      blockType: EntityType.PVCellFactory,
      keybind: KeybindActions.Hotbar1,
    },
    {
      blockType: EntityType.SolarPanel,
      keybind: KeybindActions.Hotbar2,
    },
    {
      blockType: EntityType.SAMLauncher,
      keybind: KeybindActions.Hotbar3,
    },
    {
      blockType: EntityType.Hangar,
      keybind: KeybindActions.Hotbar4,
    },
    {
      blockType: EntityType.DroneFactory,
      keybind: KeybindActions.Hotbar5,
    },
    {
      blockType: EntityType.AlloyFactory,
      keybind: KeybindActions.Hotbar6,
    },
    {
      blockType: EntityType.StarmapperStation,
      keybind: KeybindActions.Hotbar7,
    },
    {
      blockType: EntityType.ShieldGenerator,
      keybind: KeybindActions.Hotbar8,
    },
    {
      blockType: EntityType.Vault,
      keybind: KeybindActions.Hotbar9,
    },
    {
      blockType: EntityType.Market,
      keybind: KeybindActions.Hotbar0,
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
    components.P_RequiredBaseLevel.getWithKeys({ prototype: EntityType.PVCellFactory as Hex, level: 1n })?.value ?? 1n;

  useEffect(() => {
    setHotbarContent(
      [buildingHotbar, playerLevel >= minAdvancedLevel ? advancedBuildingHotbar : undefined].filter(Boolean) as Hotbar[]
    );
  }, [playerLevel, minAdvancedLevel]);

  return hotbarContent;
};
