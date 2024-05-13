import { memo } from "react";
import { AsteroidHUD } from "@/components/hud/asteroid";
import { StarbeltHUD } from "@/components/hud/starbelt";
import { GlobalHUD } from "@/components/hud/global";
import { CommandCenterHUD } from "@/components/hud/command";
import { AsteroidLoading } from "@/components/hud/asteroid/AsteroidLoading";

export const GameHUD = memo(() => {
  return (
    <div>
      <AsteroidHUD />
      <StarbeltHUD />
      <CommandCenterHUD />
      <GlobalHUD />
      <AsteroidLoading />
    </div>
  );
});
