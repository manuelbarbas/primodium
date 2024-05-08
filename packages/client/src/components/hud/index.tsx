import { HUD } from "@/components/core/HUD";
import { AsteroidLoading } from "@/components/hud/asteroid/AsteroidLoading";
import { AvailableObjectives } from "@/components/hud/global/AvailableObjectives";
import { Dock } from "@/components/hud/global/Dock";
import { ModeSelector } from "@/components/hud/global/ModeSelector";
import { Blueprints } from "@/components/hud/asteroid/blueprints/Blueprints";
import { Inventory } from "@/components/hud/asteroid/inventory/Inventory";
import { BlueprintInfoMarker } from "@/components/hud/asteroid/markers/BlueprintInfoMarker";
import { BuildingMenuPopup } from "@/components/hud/asteroid/markers/BuildingMenuPopup";
import { Intro } from "@/components/hud/modals/Intro";
import { FavoriteAsteroids } from "@/components/hud/global/FavoriteAsteroids";
import { WarshipPopulation } from "@/components/hud/global/WarshipPopulation";
import { StarmapNavigator } from "@/components/hud/starbelt/starmap-navigator/StarmapNavigator";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { HoverInfo } from "@/components/hud/hover/HoverInfo";
import { AsteroidMenuPopup } from "@/components/hud/starbelt/markers/AsteroidMenuPopup";
import { CommandViewSelector } from "@/components/hud/CommandViewSelector";

export const GameHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));

  return (
    <div className={`screen-container relative`}>
      <HUD scale={uiScale}>
        <div className="absolute top-0 left-0 h-32 w-screen bg-gradient-to-b from-black to-transparent" />
        {/* MARKERS */}
        <AsteroidMenuPopup />
        <BuildingMenuPopup />
        <BlueprintInfoMarker />
        <Intro />

        {/* Widgets */}
        <HUD.TopLeft>
          <WarshipPopulation />
        </HUD.TopLeft>

        <HUD.TopMiddle className="flex flex-col items-center gap-2">
          <ModeSelector />
        </HUD.TopMiddle>
        <HUD.TopRight className="flex flex-col items-end gap-2">
          <FavoriteAsteroids />
          <AvailableObjectives />
        </HUD.TopRight>

        <HUD.Right>
          <Inventory />
          <StarmapNavigator />
        </HUD.Right>

        <HUD.Left>
          <Blueprints />
          <CommandViewSelector />
        </HUD.Left>

        <HUD.BottomMiddle>
          <Dock />
        </HUD.BottomMiddle>
      </HUD>
      <HUD>
        <HUD.CursorFollower>
          <HoverInfo />
        </HUD.CursorFollower>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
      <AsteroidLoading />
    </div>
  );
});
