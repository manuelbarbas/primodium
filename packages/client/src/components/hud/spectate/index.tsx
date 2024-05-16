import { HUD } from "@/components/core/HUD";
import { Inventory } from "@/components/hud/asteroid/inventory/Inventory";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";

export const SpectateHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inSpectateMode = components.SelectedMode.use()?.value === Mode.Spectate;

  if (!inSpectateMode) return null;

  return (
    <div className={`screen-container relative`}>
      <HUD scale={uiScale}>
        <HUD.Right>
          <Inventory />
        </HUD.Right>
      </HUD>
    </div>
  );
});
