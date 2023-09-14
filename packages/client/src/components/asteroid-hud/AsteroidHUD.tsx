import { useEffect } from "react";

import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
import { Fleets } from "./units-pane/Units";
import { PlayerInfo } from "./player-info/PlayerInfo";
// import { BuildingMenu } from "./BuildingMenu/BuildingMenu";
import { Resources } from "./resources/Resources";
import { Hotbar } from "./hotbar/Hotbar";
import { Units } from "./units/Units";
import { Leaderboard } from "./Leaderboard";
import { CurrentObjective } from "./CurrentObjective";
import { Button } from "../core/Button";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { BlueprintInfo } from "./tile-info/BlueprintInfo";
import { getBlockTypeName } from "src/util/common";
import { BuildingMenu } from "./building-menu/BuildingMenu";

export const AsteroidHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);
  const { addListener } = primodium.api(AsteroidMap.KEY)!.input;
  const selectedBuilding = SelectedBuilding.use()?.value;

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
              {(getBlockTypeName(selectedBuilding) || !selectedBuilding) && (
                <Hotbar />
              )}
              {!getBlockTypeName(selectedBuilding) && <BuildingMenu />}
            </HUD.BottomMiddle>
            <HUD.TopMiddle>
              {!getBlockTypeName(selectedBuilding) && (
                <>
                  <Leaderboard />
                  <CurrentObjective />
                </>
              )}
              {getBlockTypeName(selectedBuilding) && selectedBuilding && (
                <BlueprintInfo buildingType={selectedBuilding} />
              )}
            </HUD.TopMiddle>
            <HUD.TopLeft>
              <PlayerInfo />
            </HUD.TopLeft>
            <HUD.TopRight>
              <Fleets />
            </HUD.TopRight>
            <HUD.BottomLeft>
              <Resources />
            </HUD.BottomLeft>
            <HUD.BottomRight>
              <Button
                className="w-full mb-2 flex border border-error ring ring-error/30 bg-error"
                onClick={() => {
                  return;
                }}
              >
                <img
                  src="img/icons/attackaircraft.png"
                  className="pixel-images w-8 h-8"
                />
                <span className="flex font-bold gap-1">STARMAP</span>
              </Button>
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
