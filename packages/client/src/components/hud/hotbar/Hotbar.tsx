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
import { Button } from "src/components/core/Button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
      <div className="flex gap-1 items-center justify-center mb-5 z-10">
        <Button
          className="btn-sm btn-ghost text-accent"
          onClick={() => {
            setActiveBar(wrap(activeBarRef.current - 1, hotbarContent.length));
            SelectedBuilding.remove();
            SelectedAction.remove();
          }}
        >
          <FaChevronLeft />
        </Button>
        <Join className="flex pointer-events-auto border-accent">
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
        <Button
          className="btn-sm btn-ghost text-accent"
          onClick={() => {
            setActiveBar(wrap(activeBarRef.current + 1, hotbarContent.length));
            SelectedBuilding.remove();
            SelectedAction.remove();
          }}
        >
          <FaChevronRight />
        </Button>
      </div>

      <HotbarBody
        activeBar={activeBarRef.current}
        setActiveBar={setActiveBar}
      />
    </div>
  );
};
