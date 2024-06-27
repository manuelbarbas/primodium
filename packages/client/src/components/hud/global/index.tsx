import { HUD } from "@/components/core/HUD";
import { AvailableObjectives } from "@/components/hud/global/AvailableObjectives";
import { Dock } from "@/components/hud/global/Dock";
import { ModeSelector } from "@/components/hud/global/ModeSelector";
// import { ModeSelector } from "@/components/hud/global/_ModeSelector";
import { Intro } from "@/components/hud/global/modals/Intro";
import { FavoriteAsteroids } from "@/components/hud/global/FavoriteAsteroids";
import { WarshipPopulation } from "@/components/hud/global/WarshipPopulation";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { HoverInfo } from "@/components/hud/global/hover/HoverInfo";
import { FollowSocials } from "@/components/shared/FollowSocials";
import { AudioPlayer } from "@/components/hud/global/MusicPlayer";
import { Coordinates } from "@/components/shared/Coordinates";

export const GlobalHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));

  return (
    <HUD scale={uiScale}>
      <div className="absolute top-0 left-0 h-32 w-screen bg-gradient-to-b from-black to-transparent" />
      <Intro />

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

      <HUD.BottomMiddle>
        <Dock />
      </HUD.BottomMiddle>
      <HUD.CursorFollower>
        <HoverInfo />
      </HUD.CursorFollower>
      <HUD.BottomLeft className="space-y-4 p-2">
        <AudioPlayer />
        <Coordinates />
      </HUD.BottomLeft>
      <HUD.BottomRight>
        <FollowSocials />
      </HUD.BottomRight>
      <HUD.BottomRight>
        <BrandingLabel />
      </HUD.BottomRight>
    </HUD>
  );
});
