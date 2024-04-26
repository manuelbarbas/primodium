import { HUD } from "@/components/core/HUD";
import { AsteroidLoading } from "@/components/hud/AsteroidLoading";
import { Dock } from "@/components/hud/Dock";
import { ModeSelector } from "@/components/hud/ModeSelector";
import { Profile } from "@/components/hud/Profile";
import { HoverTarget } from "@/components/hud/markers/HoverTarget";
import { BlueprintInfoMarker } from "@/components/hud/markers/asteroid/BlueprintInfoMarker";
import { BuildingMenuPopup } from "@/components/hud/markers/asteroid/BuildingMenuPopup";
import { AsteroidTarget } from "@/components/hud/markers/starmap/AsteroidTarget";
import { BuildMarker } from "@/components/hud/markers/starmap/BuildMarker";
import { FleetTarget } from "@/components/hud/markers/starmap/FleetTarget";
import { HomeMarker } from "@/components/hud/markers/starmap/HomeMarker";
import { OwnedAsteroids } from "@/components/hud/widgets/OwnedAsteroids";
import { OwnedFleets } from "@/components/hud/widgets/OwnedFleets";
import { UnitDeaths } from "@/components/hud/widgets/UnitDeaths";
import { Blueprints } from "@/components/hud/blueprints/Blueprints";
import { Resources } from "@/components/hud/resources/Resources";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { HoverInfo } from "./hover/HoverInfo";

export const GameHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));

  return (
    <div className={`screen-container`}>
      <HUD scale={uiScale}>
        {/* MARKERS */}
        <BuildMarker />
        <HomeMarker />
        <AsteroidTarget />
        <FleetTarget />
        <HoverTarget />
        <BuildingMenuPopup />
        <BlueprintInfoMarker />

        {/* Widgets */}
        <HUD.TopLeft className="flex flex-col gap-2">
          <Profile />
          <UnitDeaths />
        </HUD.TopLeft>

        <HUD.TopMiddle className="flex flex-col items-center gap-2">
          <ModeSelector />
        </HUD.TopMiddle>
        <HUD.TopRight className="flex flex-col items-end gap-2">
          <OwnedAsteroids />
          <OwnedFleets />
        </HUD.TopRight>

        <HUD.Right>
          <Resources />
        </HUD.Right>

        <HUD.Left>
          <Blueprints />
        </HUD.Left>

        <HUD.BottomMiddle>
          <Dock />
        </HUD.BottomMiddle>
        <HUD.BottomRight>{/* <Chat /> */}</HUD.BottomRight>
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
