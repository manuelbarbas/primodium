import { KeybindActions } from "@game/constants";
import { BlockType } from "src/util/constants";

const hotbarContent = [
  {
    name: "Main Base",
    icon: "/img/icons/mainbaseicon.png",
    buildings: [
      {
        blockType: BlockType.MainBase,
        name: "Main Base",
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
        name: "Iron Mine",
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.CopperMine,
        name: "Copper Mine",
        keybind: KeybindActions.Hotbar1,
      },
      {
        blockType: BlockType.LithiumMine,
        name: "Lithium Mine",
        keybind: KeybindActions.Hotbar2,
      },
      {
        blockType: BlockType.Conveyor,
        name: "Conveyor",
        keybind: KeybindActions.Hotbar3,
      },
      {
        blockType: BlockType.HardenedDrill,
        name: "Miner",
        keybind: KeybindActions.Hotbar4,
      },
    ],
  },
  {
    name: "Factories",
    icon: "/img/icons/factoriesicon.png",
    buildings: [
      {
        blockType: BlockType.StorageUnit,
        name: "Storage Unit",
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.IronPlateFactory,
        name: "Iron Plate Factory",
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
        name: "Conveyor",
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
        name: "Debug Iron Mine",
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.DebugIronPlateFactory,
        name: "Debug Plate Factory",
        keybind: KeybindActions.Hotbar1,
      },
      {
        blockType: BlockType.DebugStorageBuilding,
        name: "Debug Storage Building",
        keybind: KeybindActions.Hotbar2,
      },
    ],
  });
}

export default hotbarContent;
