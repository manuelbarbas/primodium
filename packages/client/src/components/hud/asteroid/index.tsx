import { HUD } from "@/components/core/HUD";
import { AsteroidLoading } from "@/components/hud/asteroid/AsteroidLoading";
import { Blueprints } from "@/components/hud/asteroid/blueprints/Blueprints";
import { Inventory } from "@/components/hud/asteroid/inventory/Inventory";
import { BlueprintInfoMarker } from "@/components/hud/asteroid/markers/BlueprintInfoMarker";
import { BuildingMenuPopup } from "@/components/hud/asteroid/markers/BuildingMenuPopup";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";

export const AsteroidHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const inAsteroidMode = components.SelectedMode.use()?.value === Mode.Asteroid;

  if (!inAsteroidMode) return null;

  return (
    <div className={`screen-container relative`}>
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
      <AsteroidLoading />
    </div>
  );
});
