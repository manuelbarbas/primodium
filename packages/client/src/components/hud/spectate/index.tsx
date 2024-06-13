import { HUD } from "@/components/core/HUD";
import { Inventory } from "@/components/hud/asteroid/inventory/Inventory";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { Mode } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

export const SpectateHUD = memo(() => {
  const { tables } = useCore();
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inSpectateMode = tables.SelectedMode.use()?.value === Mode.Spectate;

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
