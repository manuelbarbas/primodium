import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import HotbarBody from "./HotbarBody";
import HotbarLabel from "./HotbarLabel";
import { useHotbarContent } from "./useHotbarContent";

import { SelectedAction, SelectedBuilding } from "src/network/components/clientComponents";
import { wrap } from "src/util/common";

const Hotbar: React.FC = () => {
  const hotbarContent = useHotbarContent();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = primodium.api(AsteroidMap.KEY)!;
  const keybinds = useKeybinds();
  const [activeBar, setActiveBar] = useState(0);
  const activeBarRef = useRef(0);

  activeBarRef.current = activeBar;

  useEffect(() => {
    const nextHotbar = addListener(KeybindActions.NextHotbar, () => {
      setActiveBar(wrap(activeBarRef.current + 1, hotbarContent.length));
      SelectedBuilding.remove();
      SelectedAction.remove();
    });

    const prevHotbar = addListener(KeybindActions.PrevHotbar, () => {
      setActiveBar(wrap(activeBarRef.current - 1, hotbarContent.length));
      SelectedBuilding.remove();
      SelectedAction.remove();
    });

    const esc = addListener(KeybindActions.Esc, () => {
      SelectedBuilding.remove();
      SelectedAction.remove();
    });

    return () => {
      // hotkeys.forEach((hotkey) => hotkey.dispose());
      nextHotbar.dispose();
      prevHotbar.dispose();
      esc.dispose();
    };
  }, [keybinds, hotbarContent]);

  return (
    <div className=" z-[1000] viewport-container fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center text-white font-mono select-none">
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 200 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 200 }}
          className="flex flex-col items-center relative mb-5"
        >
          <div className="flex gap-2 mb-2 ">
            {hotbarContent.map((item, index) => {
              return (
                <HotbarLabel
                  key={index}
                  icon={item.icon}
                  name={item.name}
                  onClick={() => setActiveBar(index)}
                  active={item.name === hotbarContent[activeBar].name}
                />
              );
            })}
          </div>
          <HotbarBody activeBar={activeBarRef.current} setActiveBar={setActiveBar} />
        </motion.div>
      </div>
    </div>
  );
};

export default Hotbar;
