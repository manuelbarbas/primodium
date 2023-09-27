import { useEffect } from "react";

import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { BrandingLabel } from "../shared/BrandingLabel";
import { Resources } from "./resources/Resources";
import { Hotbar } from "./hotbar/Hotbar";
import { Units } from "./units/Units";
import { Score } from "./Score";
import {
  MapOpen,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { BlueprintInfo } from "./tile-info/BlueprintInfo";
import { getBlockTypeName } from "src/util/common";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { ViewStarmap } from "./ViewStarmap";
import { Panes } from "./panes/Panes";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { LoadingIndication } from "./LoadingIndication";

export const GameHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);

  const selectedBuilding = SelectedBuilding.use()?.value;
  const mapOpen = MapOpen.use(undefined, {
    value: false,
  }).value;

  useEffect(() => {
    const asteroidListener = primodium
      .api(Scenes.Asteroid)
      .input.addListener(KeybindActions.ToggleUI, toggleShowUI);
    const starmapListener = primodium
      .api(Scenes.Starmap)
      .input.addListener(KeybindActions.ToggleUI, toggleShowUI);

    return () => {
      asteroidListener.dispose();
      starmapListener.dispose();
    };
  }, []);

  return (
    <div className="screen-container font-mono">
      <>
        {/* ASTEROID HUD */}
        {!mapOpen && showUI && (
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
              <LoadingIndication />
              {/* <CurrentObjective /> */}
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

        {/* STARMAP HUD */}
        {mapOpen && showUI && (
          <HUD scale={1} pad>
            <HUD.BottomMiddle>
              <SpacerockMenu />
            </HUD.BottomMiddle>
            <HUD.TopMiddle>
              <ViewStarmap />
            </HUD.TopMiddle>
            <HUD.TopLeft>
              <Score />
              <LoadingIndication />
              {/* <CurrentObjective /> */}
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
