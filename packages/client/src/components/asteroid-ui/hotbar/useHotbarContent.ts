import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { Level } from "src/network/components/chainComponents";
import { BlockType } from "src/util/constants";
import { hashAndTrimKeyCoord, hashKeyEntity } from "src/util/encode";
import { Hotbar } from "src/util/types";

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
  const mainBaseCoord = useMainBaseCoord();
  const [hotbarContent, setHotbarContent] = useState<Hotbar[]>([
    buildingHotbar,
  ]);
  const coordEntity = hashAndTrimKeyCoord(BlockType.BuildingKey, {
    x: mainBaseCoord?.x ?? 0,
    y: mainBaseCoord?.y ?? 0,
    parent: mainBaseCoord?.parent ?? ("0" as EntityID),
  });

  const mainBaseLevel = Level.use(coordEntity, {
    value: 0,
  }).value;

  const minAdvancedLevel = Level.use(
    hashKeyEntity(BlockType.IronPlateFactory, 1),
    {
      value: 0,
    }
  ).value;

  useEffect(() => {
    setHotbarContent(
      [
        buildingHotbar,
        mainBaseLevel >= minAdvancedLevel ? advancedBuildingHotbar : undefined,
      ].filter(Boolean) as Hotbar[]
    );
  }, [mainBaseLevel]);

  return hotbarContent;
};
