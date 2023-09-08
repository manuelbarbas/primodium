import { useEffect } from "react";

import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { BrandingLabel } from "../shared/BrandingLabel";
import { HUD } from "../shared/HUD";

export const AsteroidHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);
  const { addListener } = primodium.api(AsteroidMap.KEY)!.input;

  useEffect(() => {
    const listener = addListener(KeybindActions.ToggleUI, toggleShowUI);

    return () => {
      listener.dispose();
    };
  }, []);

  return (
    <div
      className="star-background screen-container font-mono
    "
    >
      {showUI && (
        <HUD scale={1}>
          <HUD.BottomMiddle>
            <button className="btn pointer-events-auto">Primary</button>
          </HUD.BottomMiddle>
          <HUD.TopRight>Panes</HUD.TopRight>
          <HUD.TopLeft>Menu</HUD.TopLeft>
          <HUD.TopMiddle>Top Middle</HUD.TopMiddle>
          <HUD.BottomLeft>Bottom Left</HUD.BottomLeft>
          <HUD.BottomRight>
            <BrandingLabel />
          </HUD.BottomRight>
        </HUD>
      )}
    </div>
  );
};
