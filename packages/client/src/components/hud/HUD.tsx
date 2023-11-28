import { useEffect } from "react";

import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { MapOpen, SelectedBuilding } from "src/network/components/clientComponents";
// import { entityToAddress, getBlockTypeName, shortenAddress } from "src/util/common";
import { useGameStore } from "../../store/GameStore";
import { HUD } from "../core/HUD";
import { OverlayModal } from "../core/OverlayModal";
import { BrandingLabel } from "../shared/BrandingLabel";
// import { GracePeriod } from "./GracePeriod";
// import { LoadingIndication } from "./LoadingIndication";
import { Profile } from "./Profile";
// import { PrototypeInfo } from "./PrototypeInfo";
import { SelectAction } from "./SelectAction";
import { BuildingMenu } from "./building-menu/BuildingMenu";
// import { Hotbar } from "./hotbar/Hotbar";
// import { Marketplace } from "./marketplace/Marketplace";
// import { Panes } from "./panes/Panes";
// import { Resources } from "./resources/Resources";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { Score } from "./Score";
import { PlayerLeaderboard } from "./modals/leaderboard/PlayerLeaderboard";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Settings } from "./modals/Settings";
import { Objectives } from "./modals/Objectives";
import { Tabs } from "../core/Tabs";
import { FaArrowRight, FaCaretLeft, FaCaretRight, FaTimes, FaTrash } from "react-icons/fa";
import { Leaderboard } from "./modals/leaderboard/Leaderboard";
import { CurrenObjective } from "./CurrentObjective";
import { Blueprints } from "./Blueprints";
import { Action } from "src/util/constants";

export const GameHUD = () => {
  const [showUI, toggleShowUI] = useGameStore((state) => [state.showUI, state.toggleShowUI]);
  const playerEntity = useMud().network.playerEntity;
  const selectedBuilding = SelectedBuilding.use()?.value;
  const spectatingAccount = components.SpectateAccount.use()?.value;
  const action = components.SelectedAction.use()?.value;
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
                    <Leaderboard />
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
                    <IconLabel imageUri="/img/icons/settingsicon.png" tooltipText="settings" tooltipDirection="right" />
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

        <HUD.TopLeft>
          <Profile />
        </HUD.TopLeft>

        <HUD.TopRight>
          <CurrenObjective />
        </HUD.TopRight>

        <HUD.Right>
          {(!selectedBuilding || action === Action.PlaceBuilding) && (
            <Tabs className="flex flex-row justify-center items-center gap-0">
              <Tabs.Button
                index={0}
                togglable
                onClick={() => {
                  components.SelectedBuilding.remove();
                  components.SelectedAction.remove();
                }}
                className="rounded-r-none m-0 border-r-0 btn-md border-warning relative py-4 hover:text-accent group"
              >
                <FaCaretLeft
                  size={22}
                  className="text-accent absolute top-1/2 left-0  -translate-y-1/2 -translate-x-full "
                />
                <IconLabel imageUri="img/icons/minersicon.png" className="text-2xl" />
                <p
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "sideways",
                  }}
                  className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
                >
                  blueprints
                </p>
              </Tabs.Button>

              <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10">
                <Blueprints />
              </Tabs.Pane>
            </Tabs>
          )}
          {selectedBuilding && !action && (
            <Tabs className="flex flex-row justify-center items-center gap-0">
              <Tabs.Button
                index={0}
                togglable
                onClick={() => components.SelectedBuilding.remove()}
                className="rounded-r-none m-0 border-r-0 btn-md border-accent relative hover:text-accent group"
              >
                <FaArrowRight />
                {/* <FaCaretLeft
                    size={22}
                    className="text-accent absolute top-1/2 left-0  -translate-y-1/2 -translate-x-full "
                  /> */}
                {/* <IconLabel imageUri="img/icons/minersicon.png" className="text-2xl" /> */}
                {/* <p
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "sideways",
                    }}
                    className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
                  >
                    manage
                  </p> */}
              </Tabs.Button>

              <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10">
                <BuildingMenu />
              </Tabs.Pane>
            </Tabs>
          )}
        </HUD.Right>

        <HUD.Left>
          <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
            <Tabs.Pane index={0} className="rounded-l-none border-l-0 h-96 z-10">
              CHAT PLACEHOLDER
            </Tabs.Pane>
            <Tabs.Button
              index={0}
              togglable
              className="rounded-l-none m-0 border-l-0 btn-md border-secondary relative py-4 hover:text-accent group"
            >
              <FaCaretRight
                size={22}
                className="text-accent absolute top-1/2 right-0  -translate-y-1/2 translate-x-full "
              />
              <IconLabel imageUri="img/icons/chaticon.png" className="text-2xl" />
              <p
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "sideways",
                }}
                className=" absolute tracking-widest uppercase font-bold -rotate-180 left-0 bottom-full my-4 ml-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
              >
                chat
              </p>
            </Tabs.Button>
          </Tabs>
        </HUD.Left>

        <HUD.BottomMiddle>
          <SpacerockMenu />
        </HUD.BottomMiddle>
      </HUD>

      <HUD>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
    </div>
  );
};
