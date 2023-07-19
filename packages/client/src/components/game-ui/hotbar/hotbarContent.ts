import { KeybindActions } from "@game/constants";
import { BlockType } from "src/util/constants";

const hotbarContent = [
  {
    name: "Main Base",
    icon: "/img/icons/mainbaseicon.png",
    buildings: [
      {
        blockType: BlockType.MainBase,
        keybind: KeybindActions.Hotbar0,
      },
    ],
  },
  {
    name: "Buildings",
    icon: "/img/icons/minersicon.png",
    buildings: [
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
      },
    ],
  },
  {
    name: "Factories",
    icon: "/img/icons/factoriesicon.png",
    buildings: [
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
  {
    name: "Transport",
    icon: "/img/icons/transporticon.png",
    buildings: [
      {
        blockType: BlockType.Conveyor,
        keybind: KeybindActions.Hotbar0,
      },
    ],
  },
];

if (import.meta.env.VITE_DEV === "true") {
  hotbarContent.push({
    name: "Debug",
    icon: "/img/icons/debugicon.png",
    buildings: [
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
        blockType: BlockType.DemolishBuilding,
        keybind: KeybindActions.Hotbar3,
      },
    ],
  });
}
export default hotbarContent;
