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
import { SelectAction } from "./SelectAction";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { Hotbar } from "./hotbar/Hotbar";
import { Marketplace } from "./marketplace/Marketplace";
import { Panes } from "./panes/Panes";
import { Resources } from "./resources/Resources";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { Units } from "./units/Units";
import { Score } from "./Score";
import { PlayerLeaderboard } from "./modals/leaderboard/PlayerLeaderboard";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Settings } from "./modals/Settings";
import { Objectives } from "./modals/Objectives";

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
        <HUD>
          <HUD.TopMiddle>
            <div className="flex flex-col items-center">
              <div className="flex z-10">
                <span className="flex flex-col gap-1 mt-1">
                  <Modal title="leaderboard">
                    <Modal.Button className="rounded-r-none border border-secondary btn-sm">
                      <IconLabel
                        imageUri="/img/icons/leaderboardicon.png"
                        tooltipText="leaderboard"
                        tooltipDirection="left"
                      />
                    </Modal.Button>
                    <Modal.Content className="w-[50rem] h-[50rem]">
                      <PlayerLeaderboard />
                    </Modal.Content>
                  </Modal>
                  <OverlayModal>
                    <OverlayModal.Button className="rounded-r-none border border-secondary btn-sm">
                      <IconLabel imageUri="/img/icons/reportsicon.png" tooltipText="messages" tooltipDirection="left" />
                    </OverlayModal.Button>
                    <OverlayModal.Content>
                      <PlayerLeaderboard />
                    </OverlayModal.Content>
                  </OverlayModal>
                </span>
                <SelectAction />
                <span className="flex flex-col gap-1 mt-1">
                  <Modal title="objectives">
                    <Modal.Button className="rounded-l-none border border-secondary btn-sm">
                      <IconLabel
                        imageUri="/img/icons/objectiveicon.png"
                        tooltipText="objectives"
                        tooltipDirection="right"
                      />
                    </Modal.Button>
                    <Modal.Content className="w-[50rem] h-[50rem]">
                      <Objectives />
                    </Modal.Content>
                  </Modal>
                  <Modal title="settings">
                    <Modal.Button className="rounded-l-none border border-secondary btn-sm">
                      <IconLabel
                        imageUri="/img/icons/settingsicon.png"
                        tooltipText="settings"
                        tooltipDirection="right"
                      />
                    </Modal.Button>
                    <Modal.Content className="w-132 h-96">
                      <Settings />
                    </Modal.Content>
                  </Modal>
                </span>
              </div>
              <Score />
            </div>
          </HUD.TopMiddle>
        </HUD>

        <HUD>
          <HUD.BottomRight>
            <BrandingLabel />
          </HUD.BottomRight>
        </HUD>
      </>
    </div>
  );
};
