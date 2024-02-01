import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { useEffect } from "react";
import { FaCaretUp } from "react-icons/fa";

import { Button } from "src/components/core/Button";
import { Join } from "src/components/core/Join";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";

export const SelectAction: React.FC<{ isSpectating: boolean }> = ({ isSpectating }) => {
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const primodium = usePrimodium();
  const { openMap, closeMap } = primodium.api().util;

  useEffect(() => {
    const starmapListener = primodium.api(Scenes.Starmap).input.addListener(KeybindActions.Map, closeMap);

    const asteroidListener = primodium.api(Scenes.Asteroid).input.addListener(KeybindActions.Map, openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, []);

  return (
    <div className="flex z-10">
      <Join className="flex border-b border-x border-secondary rounded-t-none">
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={closeMap}
          className={`flex-1 relative rounded-t-none rounded-r-none ${
            mapOpen ? "opacity-50" : "ring ring-accent z-10"
          }`}
        >
          {isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/spectateicon.png" className="pixel-images w-12 h-12" />
              <p className="">SPECTATE</p>
            </div>
          )}
          {!isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/minersicon.png" className="pixel-images w-12 h-12" />
              <p className="">BUILD</p>
            </div>
          )}
          {!mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={openMap}
          className={`flex-1 rounded-t-none rounded-l-none disabled:opacity-100 ${
            !mapOpen ? "opacity-50" : "ring ring-accent z-10"
          }`}
        >
          <div className="flex flex-col gap-2 items-center p-2 w-16">
            <img src="img/icons/starmapicon.png" className="pixel-images w-12 h-12" />
            <p className="">CONQUER</p>
          </div>
          {mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
      </Join>
    </div>
  );
};
