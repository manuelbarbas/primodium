import { memo } from "react";

import { AsteroidHUD } from "@/components/hud/asteroid";
import { AsteroidLoading } from "@/components/hud/asteroid/AsteroidLoading";
import { CommandCenterHUD } from "@/components/hud/command";
import { GlobalHUD } from "@/components/hud/global";
import { SpectateHUD } from "@/components/hud/spectate";
import { StarbeltHUD } from "@/components/hud/starbelt";

export const GameHUD = memo(() => {
  return (
    <div>
      <AsteroidHUD />
      <SpectateHUD />
      <StarbeltHUD />
      <CommandCenterHUD />
      <GlobalHUD />
      <AsteroidLoading />
    </div>
  );
});
