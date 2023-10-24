import { useEffect } from "react";

import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";

import { MapOpen, SelectedBuilding } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
// import { LoadingIndication } from "./LoadingIndication";
import { Score } from "./Score";
// import { ViewStarmap } from "./ViewStarmap";
import { PrototypeInfo } from "./PrototypeInfo";
import { ViewStarmap } from "./ViewStarmap";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { Hotbar } from "./hotbar/Hotbar";
import { Panes } from "./panes/Panes";
import { Resources } from "./resources/Resources";
// import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { Units } from "./units/Units";

export const GameHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [state.showUI, state.toggleShowUI]);

  const selectedBuilding = SelectedBuilding.use()?.value;
  const mapOpen = MapOpen.use(undefined, {
    value: false,
  }).value;

  useEffect(() => {
    const asteroidListener = primodium.api(Scenes.Asteroid).input.addListener(KeybindActions.ToggleUI, toggleShowUI);
    const starmapListener = primodium.api(Scenes.Starmap).input.addListener(KeybindActions.ToggleUI, toggleShowUI);

    return () => {
      asteroidListener.dispose();
      starmapListener.dispose();
    };
  }, [toggleShowUI]);

  return (
    <div className="screen-container font-mono">
      <>
        {/* ASTEROID HUD */}
        {showUI && (
          <HUD scale={1} pad>
            <HUD.BottomMiddle>
              {(getBlockTypeName(selectedBuilding) || !selectedBuilding) && !mapOpen && <Hotbar />}
              {!getBlockTypeName(selectedBuilding) && <BuildingMenu />}
            </HUD.BottomMiddle>
            <HUD.TopMiddle>
              {getBlockTypeName(selectedBuilding) && selectedBuilding && <PrototypeInfo building={selectedBuilding} />}
              {(!selectedBuilding || !getBlockTypeName(selectedBuilding)) && <ViewStarmap />}
            </HUD.TopMiddle>
            <HUD.TopLeft>
              <Score />
              {/* <LoadingIndication /> */}
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
        )}

        <HUD>
          <HUD.BottomRight>
            <BrandingLabel />
          </HUD.BottomRight>
        </HUD>
      </>
    </div>
  );
};
