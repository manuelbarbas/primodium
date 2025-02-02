import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { Mode } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { HUD } from "@/components/core/HUD";
import { Blueprints } from "@/components/hud/asteroid/blueprints/Blueprints";
import { Inventory } from "@/components/hud/asteroid/inventory/Inventory";
import { BlueprintInfoMarker } from "@/components/hud/asteroid/markers/BlueprintInfoMarker";
import { BuildingMenuPopup } from "@/components/hud/asteroid/markers/BuildingMenuPopup";

export const AsteroidHUD = memo(() => {
  const { tables } = useCore();
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inAsteroidMode = tables.SelectedMode.use()?.value === Mode.Asteroid;

  if (!inAsteroidMode) return null;

  return (
    <HUD scale={uiScale}>
      {/* MARKERS */}
      <BuildingMenuPopup />
      <BlueprintInfoMarker />

      <HUD.Right>
        <Inventory />
      </HUD.Right>

      <HUD.Left>
        <Blueprints />
      </HUD.Left>
    </HUD>
  );
});
