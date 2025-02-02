import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { HUD } from "@/components/core/HUD";
import { AvailableObjectives } from "@/components/hud/global/AvailableObjectives";
import { Dock } from "@/components/hud/global/Dock";
import { FavoriteAsteroids } from "@/components/hud/global/FavoriteAsteroids";
import { HoverInfo } from "@/components/hud/global/hover/HoverInfo";
import { Intro } from "@/components/hud/global/modals/Intro";
import { ModeSelector } from "@/components/hud/global/ModeSelector";
import { AudioPlayer } from "@/components/hud/global/MusicPlayer";
import { WarshipPopulation } from "@/components/hud/global/WarshipPopulation";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { Coordinates } from "@/components/shared/Coordinates";
import { FollowSocials } from "@/components/shared/FollowSocials";

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
