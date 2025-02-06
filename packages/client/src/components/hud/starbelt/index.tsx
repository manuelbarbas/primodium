import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { Keys, Mode } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { HUD } from "@/components/core/HUD";
import { AsteroidMenuPopup } from "@/components/hud/starbelt/markers/AsteroidMenuPopup";
import { StarmapNavigator } from "@/components/hud/starbelt/starmap-navigator/StarmapNavigator";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

export const StarbeltHUD = memo(() => {
  const { tables } = useCore();
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const isStarbeltOpen = tables.SelectedMode.use()?.value === Mode.Starmap;

  if (!isStarbeltOpen) return null;

  return (
    <HUD scale={uiScale}>
      <LoadingOverlay
        syncId={Keys.SECONDARY}
        loadingMessage="Loading Starbelt"
        errorMessage="Error syncing starbelt data. Please refresh the page."
        className="screen-container relative"
      >
        {/* MARKERS */}
        <AsteroidMenuPopup />

        <HUD.Left>
          <StarmapNavigator />
        </HUD.Left>
      </LoadingOverlay>
    </HUD>
  );
});
