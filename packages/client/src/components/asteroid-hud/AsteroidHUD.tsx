import { useEffect } from "react";

import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
import { StatusBar } from "./StatusBar";
import { Fleets } from "./Fleets";
import { PlayerInfo } from "./PlayerInfo";

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
    <div className="star-background screen-container font-mono">
      {showUI && (
        <>
          <HUD pad>
            <HUD.BottomMiddle>
              <button className="btn pointer-events-auto">Primary</button>
            </HUD.BottomMiddle>
            <HUD.TopLeft>
              <PlayerInfo />
            </HUD.TopLeft>
            <HUD.TopMiddle>
              <StatusBar />
            </HUD.TopMiddle>
            <HUD.TopRight>
              <Fleets />
            </HUD.TopRight>
          </HUD>
          <HUD>
            <HUD.BottomRight>
              <BrandingLabel />
            </HUD.BottomRight>
          </HUD>
        </>
      )}
    </div>
  );
};
