import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { useEffect, useRef, useState } from "react";
import { useMud } from "src/context/MudContext";
import { useGameStore } from "src/store/GameStore";
import { BackgroundImage, BlockType, KeyImages } from "src/util/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Key } from "src/engine/lib/core/createInput";

const config = [
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
  config.push({
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

export const Hotbar = () => {
  const network = useMud();
  const isReady = useGameStore((state) => state.isReady);
  const keybinds = primodium.hooks.useKeybinds();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [activeBar, setActiveBar] = useState(0);
  const activeBarRef = useRef(0);

  activeBarRef.current = activeBar;
  const prevKey = keybinds[KeybindActions.PrevHotbar]?.entries().next()
    .value[0] as Key;
  const nextKey = keybinds[KeybindActions.NextHotbar]?.entries().next()
    .value[0] as Key;
  const prevKeyImage = KeyImages.get(prevKey);
  const nextKeyImage = KeyImages.get(nextKey);

  useEffect(() => {
    if (!isReady) return;

    const hotkeyListener = (index: number) => {
      const wrappedIndex = wrap(
        index,
        config[activeBarRef.current].buildings.length
      );

      const building =
        config[activeBarRef.current].buildings[wrappedIndex].blockType;

      const selectedBuilding = primodium.components
        .selectedBuilding(network)
        .get();

      if (selectedBuilding === building) {
        primodium.components.selectedBuilding(network).remove();
        return;
      }

      primodium.components
        .selectedBuilding(network)
        .set(config[activeBarRef.current].buildings[wrappedIndex].blockType);
    };

    const hotkey1 = primodium.input.addListener(KeybindActions.Hotbar0, () =>
      hotkeyListener(0)
    );
    const hotkey2 = primodium.input.addListener(KeybindActions.Hotbar1, () =>
      hotkeyListener(1)
    );
    const hotkey3 = primodium.input.addListener(KeybindActions.Hotbar2, () =>
      hotkeyListener(2)
    );
    const hotkey4 = primodium.input.addListener(KeybindActions.Hotbar3, () =>
      hotkeyListener(3)
    );
    const hotkey5 = primodium.input.addListener(KeybindActions.Hotbar4, () =>
      hotkeyListener(4)
    );

    return () => {
      hotkey1.dispose();
      hotkey2.dispose();
      hotkey3.dispose();
      hotkey4.dispose();
      hotkey5.dispose();
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const nextHotbar = primodium.input.addListener(
      KeybindActions.NextHotbar,
      () => setActiveBar(wrap(activeBarRef.current + 1, config.length))
    );

    const prevHotbar = primodium.input.addListener(
      KeybindActions.PrevHotbar,
      () => setActiveBar(wrap(activeBarRef.current - 1, config.length))
    );

    return () => {
      nextHotbar.dispose();
      prevHotbar.dispose();
    };
  }, [isReady]);

  useEffect(() => {
    primodium.components.selectedBuilding(network).remove();

    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 10); // Reset after animation duration

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, [activeBar]);

  return (
    <AnimatePresence>
      <div className=" z-[1000] viewport-container fixed inset-x-0 bottom-4 flex justify-center text-white drop-shadow-xl font-mono select-none">
        <div className="flex flex-col items-center">
          <div
            className="relative flex flex-col items-center mb-2 cursor-pointer"
            onClick={() =>
              setActiveBar(wrap(activeBarRef.current + 1, config.length))
            }
          >
            <img
              src={config[activeBar].icon}
              className={`relative w-5 h-5 pixel-images z-20 shadow-2xl drop-shadow-2xl ${
                shouldAnimate
                  ? "scale-0"
                  : "scale-150 transition-all duration-300"
              }`}
            />

            <div className="relative px-2">
              <p className="relative font-bold px-2 z-30 shadow-2xl">
                {config[activeBar].name}
              </p>
              <span className="absolute inset-0 bg-gray-900 z-10 ring-2 ring-gray-900/50"></span>
            </div>
          </div>
          <motion.div layout="position" className="flex items-center space-x-2">
            {prevKeyImage && (
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  setActiveBar(wrap(activeBarRef.current - 1, config.length))
                }
              >
                <img
                  src="/img/buttons/chevron.png"
                  className="pixel-images scale-x-[-1] w-8"
                />
                <img
                  src={prevKeyImage}
                  className="absolute w-8 h-8 pixel-images"
                />
              </div>
            )}
            <motion.div
              layout="position"
              transition={{
                layout: { duration: 0.3 },
              }}
              className="relative bg-gray-900/80 border-4 border-t-slate-300 border-x-slate-400 border-b-slate-500 p-2 ring-4 ring-gray-900/80"
            >
              <div className={`flex space-x-3 p-1`}>
                {config[activeBar].buildings.map((tile, index) => {
                  return (
                    <Hotbar.Item
                      key={index}
                      blockType={tile.blockType}
                      name={tile.name}
                      keybind={tile.keybind}
                    />
                  );
                })}
              </div>
            </motion.div>
            {nextKeyImage && (
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  setActiveBar(wrap(activeBarRef.current + 1, config.length))
                }
              >
                <img
                  src="/img/buttons/chevron.png"
                  className="pixel-images w-8"
                />
                <img
                  src={nextKeyImage}
                  className="absolute w-8 h-8 pixel-images"
                />
              </div>
            )}
          </motion.div>

          <Hotbar.Pagination
            index={activeBar}
            className="mt-4"
            onClick={() =>
              setActiveBar(wrap(activeBarRef.current + 1, config.length))
            }
          />
        </div>
      </div>
    </AnimatePresence>
  );
};

Hotbar.Pagination = ({
  index,
  className,
  onClick,
}: {
  index: number;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`flex h-full space-x-2 hover:bg-gray-900/50 transition-all cursor-pointer p-2 ${className}`}
      onClick={onClick}
    >
      {config.map((_, i) => {
        return (
          <div
            key={i}
            className={`w-2 h-2 transition-all duration-500 shadow-inner  ${
              i === index
                ? "scale-125 bg-gray-200 ring-1 ring-gray-900"
                : "bg-gray-900 scale-100"
            }`}
          />
        );
      })}
    </div>
  );
};

Hotbar.Item = ({
  blockType,
  name,
  keybind,
}: {
  blockType: EntityID;
  name: string;
  keybind: KeybindActions;
}) => {
  const network = useMud();
  const selectedBuilding = primodium.hooks.useSelectedBuilding(network);
  const keybinds = primodium.hooks.useKeybinds();

  const key = keybinds[keybind]?.entries().next().value[0] as Key;
  const keyImage = KeyImages.get(key);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.5 },
      }}
    >
      <div className="relative flex flex-col text-sm items-center cursor-pointer">
        <img
          src={BackgroundImage.get(blockType)}
          onClick={() => {
            if (selectedBuilding === blockType) {
              primodium.components.selectedBuilding(network).remove();
              return;
            }

            primodium.components.selectedBuilding(network).set(blockType);
          }}
          className={`w-16 h-16 pixel-images ring-2 ring-gray-600 ${
            selectedBuilding === blockType
              ? " border-4 border-yellow-500 border-b-yellow-700 border-t-yellow-300 scale-110 transistion-all duration-100"
              : ""
          }`}
        />
        {selectedBuilding === blockType && (
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3 },
            }}
            className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 px-1"
          >
            {name}
          </motion.p>
        )}
        {keyImage && (
          <img
            src={keyImage}
            className={`absolute -top-3 -left-3 w-8 h-8 pixel-images ${
              selectedBuilding === blockType ? "opacity-50" : ""
            }`}
          />
        )}
      </div>
    </motion.div>
  );
};

const wrap = (index: number, length: number) => {
  return ((index % length) + length) % length;
};
