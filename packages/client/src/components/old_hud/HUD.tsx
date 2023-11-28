import { useEffect } from "react";

import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { MapOpen, SelectedBuilding } from "src/network/components/clientComponents";
import { entityToAddress, getBlockTypeName, shortenAddress } from "src/util/common";
import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { OverlayModal } from "../core/OverlayModal";
import { BrandingLabel } from "../shared/BrandingLabel";
import { GracePeriod } from "./GracePeriod";
import { LoadingIndication } from "./LoadingIndication";
import { Profile } from "./Profile";
import { PrototypeInfo } from "./PrototypeInfo";
import { ViewStarmap } from "./ViewStarmap";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { Hotbar } from "./hotbar/Hotbar";
import { Marketplace } from "./marketplace/Marketplace";
import { Panes } from "./panes/Panes";
import { Resources } from "./resources/Resources";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { Units } from "../hud/spacerock-menu/widgets/resources/units/Units";

export const GameHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [state.showUI, state.toggleShowUI]);
  const playerEntity = useMud().network.playerEntity;
  const selectedBuilding = SelectedBuilding.use()?.value;
  const spectatingAccount = components.SpectateAccount.use()?.value;
  const mapOpen = MapOpen.use(undefined, {
    value: false,
  }).value;

  const isSpectating = spectatingAccount !== playerEntity;

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
        {showUI && !isSpectating && (
          <HUD scale={1} pad>
            <HUD.BottomMiddle>
              {(getBlockTypeName(selectedBuilding) || !selectedBuilding) && !mapOpen && <Hotbar />}
              {!getBlockTypeName(selectedBuilding) && !mapOpen && <BuildingMenu />}
              {mapOpen && <SpacerockMenu />}
            </HUD.BottomMiddle>
            <HUD.TopMiddle>
              {getBlockTypeName(selectedBuilding) && selectedBuilding && <PrototypeInfo building={selectedBuilding} />}
              {(!selectedBuilding || !getBlockTypeName(selectedBuilding)) && <ViewStarmap />}
              <GracePeriod player={playerEntity} />
            </HUD.TopMiddle>
            <HUD.TopLeft>
              <Profile />
              <LoadingIndication />
            </HUD.TopLeft>
            <HUD.Left>
              <OverlayModal title="Marketplace">
                <OverlayModal.Button>Marketplace</OverlayModal.Button>
                <OverlayModal.Content>
                  <Marketplace />
                </OverlayModal.Content>
              </OverlayModal>
            </HUD.Left>

            <HUD.BottomLeft>
              <Resources />
            </HUD.BottomLeft>
            <HUD.BottomRight>
              <Units />
            </HUD.BottomRight>
            <HUD.TopRight>
              <Panes />
            </HUD.TopRight>
          </HUD>
        )}

        {showUI && isSpectating && !mapOpen && (
          <HUD scale={1} pad>
            <HUD.BottomMiddle>
              <p className="font-bold text-accent">SPECTATING {shortenAddress(entityToAddress(spectatingAccount!))}</p>
            </HUD.BottomMiddle>
            <HUD.TopMiddle>
              {<ViewStarmap />}
              <GracePeriod player={spectatingAccount!} />
            </HUD.TopMiddle>
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
