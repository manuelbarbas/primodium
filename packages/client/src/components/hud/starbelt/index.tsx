import { HUD } from "@/components/core/HUD";
import { StarmapNavigator } from "@/components/hud/starbelt/starmap-navigator/StarmapNavigator";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AsteroidMenuPopup } from "@/components/hud/starbelt/markers/AsteroidMenuPopup";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { useCore } from "@primodiumxyz/core/react";
import { Mode, Keys } from "@primodiumxyz/core";

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
