import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { Action, BlockType } from "src/util/constants";

type HotbarItem = {
  blockType: EntityID;
  keybind: KeybindActions;
  action?: Action;
};

type Hotbar = {
  name: string;
  icon: string;
  items: HotbarItem[];
};

const hotbarContent: Hotbar[] = [
  {
    name: "Main Base",
    icon: "/img/icons/mainbaseicon.png",
    items: [
      {
        blockType: BlockType.MainBase,
        keybind: KeybindActions.Hotbar0,
      },
    ],
  },
  {
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
    ],
  },
  {
    name: "Transport123",
    icon: "/img/icons/transporticon.png",
    items: [
      {
        blockType: BlockType.Conveyor,
        keybind: KeybindActions.Hotbar0,
        action: Action.Conveyor,
      },
    ],
  },
  {
    name: "Factories",
    icon: "/img/icons/factoriesicon.png",
    items: [
      {
        blockType: BlockType.StorageUnit,
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.IronPlateFactory,
        keybind: KeybindActions.Hotbar1,
      },
    ],
  },
];

if (import.meta.env.VITE_DEV === "true") {
  hotbarContent.push({
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
  });
}
export default hotbarContent;
