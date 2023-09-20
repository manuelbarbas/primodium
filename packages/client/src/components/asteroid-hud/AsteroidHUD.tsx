import { useEffect } from "react";

import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
import { Resources } from "./resources/Resources";
import { Hotbar } from "./hotbar/Hotbar";
import { Units } from "./units/Units";
import { Score } from "./Score";
import { CurrentObjective } from "./CurrentObjective";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { BlueprintInfo } from "./tile-info/BlueprintInfo";
import { getBlockTypeName } from "src/util/common";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { ViewStarmap } from "./ViewStarmap";
import { Panes } from "./panes/Panes";

export const AsteroidHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);
  const { addListener } = primodium.api()!.input;
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
              {getBlockTypeName(selectedBuilding) && selectedBuilding && (
                <BlueprintInfo buildingType={selectedBuilding} />
              )}
              {(!selectedBuilding || !getBlockTypeName(selectedBuilding)) && (
                <ViewStarmap />
              )}
            </HUD.TopMiddle>
            <HUD.TopLeft>
              <Score />
              <CurrentObjective />
            </HUD.TopLeft>
            <HUD.TopRight>
              <Panes />
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
