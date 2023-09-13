import { useEffect } from "react";

import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
import { Fleets } from "./Fleets";
import { PlayerInfo } from "./PlayerInfo";
// import { BuildingMenu } from "./BuildingMenu/BuildingMenu";
import { Resources } from "./resources/Resources";
import Hotbar from "../asteroid-ui-old/hotbar/Hotbar";
import { Units } from "./units/Units";
import { Leaderboard } from "./Leaderboard";
import { CurrentObjective } from "./CurrentObjective";

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
    <div className="screen-container font-mono">
      {showUI && (
        <>
          <HUD scale={1} pad>
            <HUD.BottomMiddle>
              <Hotbar />
              {/* <BuildingMenu /> */}
            </HUD.BottomMiddle>
            <HUD.TopLeft>
              <PlayerInfo />
            </HUD.TopLeft>
            <HUD.TopMiddle>
              <Leaderboard />
              <CurrentObjective />
            </HUD.TopMiddle>
            <HUD.TopRight>
              <Fleets />
            </HUD.TopRight>
            <HUD.BottomLeft>
              <Resources />
            </HUD.BottomLeft>
            <HUD.BottomRight>
              <Units />
            </HUD.BottomRight>
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
