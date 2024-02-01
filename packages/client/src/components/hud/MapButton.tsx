import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { useEffect } from "react";

import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";

export const MapButton: React.FC<{ isSpectating: boolean }> = ({ isSpectating }) => {
  const mapOpen = components.MapOpen.use()?.value;

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
    <div className="pl-2 flex flex-col items-center gap-1 drop-shadow-hard group">
      <Button
        className={`rounded-t-none border border-t-0 border-accent btn-sm text-3xl px-10 py-6 ${
          !mapOpen ? "star-background-sm" : "topographic-background-md"
        } group-hover:!border-success`}
        clickSound={AudioKeys.Sequence}
        onClick={!mapOpen ? openMap : closeMap}
      >
        {!mapOpen && !isSpectating && <IconLabel imageUri="/img/icons/starmapicon.png" />}
        {!mapOpen && isSpectating && <IconLabel imageUri="/img/icons/returnicon.png" />}
        {mapOpen && <IconLabel imageUri="/img/icons/minersicon.png" />}
      </Button>
      <p className="font-semibold bg-white/10 group-hover:bg-secondary/20 px-2 uppercase">
        {!mapOpen ? (isSpectating ? "stop spectating" : "star map") : "Return to asteroid"}
      </p>
    </div>
  );
};
