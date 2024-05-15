import { HUD } from "@/components/core/HUD";
import { StarmapNavigator } from "@/components/hud/starbelt/starmap-navigator/StarmapNavigator";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AsteroidMenuPopup } from "@/components/hud/starbelt/markers/AsteroidMenuPopup";
import { Mode } from "@/util/constants";
import { components } from "@/network/components";

export const StarbeltHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const isStarbeltOpen = components.SelectedMode.use()?.value === Mode.Starmap;

  if (!isStarbeltOpen) return null;

  return (
    <div className={`screen-container relative`}>
      <HUD scale={uiScale}>
        {/* MARKERS */}
        <AsteroidMenuPopup />

        <HUD.Right>
          <StarmapNavigator />
        </HUD.Right>
      </HUD>
    </div>
  );
});
