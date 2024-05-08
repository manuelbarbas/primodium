import { memo } from "react";
import { AsteroidHUD } from "@/components/hud/asteroid";
import { StarbeltHUD } from "@/components/hud/starbelt";
import { GlobalHUD } from "@/components/hud/global";
import { CommandCenterHUD } from "@/components/hud/command";

export const GameHUD = memo(() => {
  return (
    <>
      <AsteroidHUD />
      <StarbeltHUD />
      <CommandCenterHUD />
      <GlobalHUD />
    </>
  );
});
