import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useMud } from "src/context/MudContext";
import { Key } from "src/engine/lib/core/createInput";
import { useGameStore } from "src/store/GameStore";
import { KeyImages } from "src/util/constants";
import HotbarItem from "./HotbarItem";
import HotbarPagination from "./HotbarPagination";
import hotbarContent from "./hotbarContent";

const Hotbar: React.FC = () => {
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

  const wrap = (index: number, length: number) => {
    return ((index % length) + length) % length;
  };

  useEffect(() => {
    if (!isReady) return;

    const hotkeyListener = (index: number) => {
      const wrappedIndex = wrap(
        index,
        hotbarContent[activeBarRef.current].buildings.length
      );

      const building =
        hotbarContent[activeBarRef.current].buildings[wrappedIndex].blockType;

      const selectedBuilding = primodium.components
        .selectedBuilding(network)
        .get();

      if (selectedBuilding === building) {
        primodium.components.selectedBuilding(network).remove();
        return;
      }

      primodium.components
        .selectedBuilding(network)
        .set(
          hotbarContent[activeBarRef.current].buildings[wrappedIndex].blockType
        );
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
    const nextHotbar = primodium.input.addListener(
      KeybindActions.NextHotbar,
      () => setActiveBar(wrap(activeBarRef.current + 1, hotbarContent.length))
    );

    const prevHotbar = primodium.input.addListener(
      KeybindActions.PrevHotbar,
      () => setActiveBar(wrap(activeBarRef.current - 1, hotbarContent.length))
    );

    return () => {
      hotkey1.dispose();
      hotkey2.dispose();
      hotkey3.dispose();
      hotkey4.dispose();
      hotkey5.dispose();
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
      <div className=" z-[1000] viewport-container fixed bottom-0 right-1/2 translate-x-1/2 flex justify-center text-white drop-shadow-xl font-mono select-none">
        <div className="flex flex-col items-center">
          <div
            className="relative flex flex-col items-center mb-2 cursor-pointer"
            onClick={() =>
              setActiveBar(wrap(activeBarRef.current + 1, hotbarContent.length))
            }
          >
            <img
              src={hotbarContent[activeBar].icon}
              className={`relative w-5 h-5 pixel-images z-20 shadow-2xl drop-shadow-2xl ${
                shouldAnimate
                  ? "scale-0"
                  : "scale-150 transition-all duration-300"
              }`}
            />

            <div className="relative px-2">
              <p className="relative font-bold px-2 z-30 shadow-2xl">
                {hotbarContent[activeBar].name}
              </p>
              <span className="absolute inset-0 bg-gray-900 z-10 ring-2 ring-gray-900/50"></span>
            </div>
          </div>
          <motion.div layout="position" className="flex items-center space-x-2">
            {prevKeyImage && (
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  setActiveBar(
                    wrap(activeBarRef.current - 1, hotbarContent.length)
                  )
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
                {hotbarContent[activeBar].buildings.map((tile, index) => {
                  return (
                    <HotbarItem
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
                  setActiveBar(
                    wrap(activeBarRef.current + 1, hotbarContent.length)
                  )
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

          <HotbarPagination
            index={activeBar}
            className="mt-2"
            onClick={() =>
              setActiveBar(wrap(activeBarRef.current + 1, hotbarContent.length))
            }
          />
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Hotbar;
