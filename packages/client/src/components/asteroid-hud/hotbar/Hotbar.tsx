import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import React, { useEffect, useRef, useState } from "react";
import HotbarBody from "./HotbarBody";
import HotbarLabel from "./HotbarLabel";
import { useHotbarContent } from "./useHotbarContent";

import {
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { wrap } from "src/util/common";
import { Join } from "src/components/core/Join";

export const Hotbar: React.FC = () => {
  const hotbarContent = useHotbarContent();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = primodium.api()!;
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
    <div className="flex flex-col items-center relative mb-2">
      <Join className="flex pointer-events-auto z-10 mb-4">
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
      </Join>
      <HotbarBody
        activeBar={activeBarRef.current}
        setActiveBar={setActiveBar}
      />
    </div>
  );
};
