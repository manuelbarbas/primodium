import { KeyNames, KeybindActions, Scenes } from "@game/constants";
import { FaArrowRight, FaCircle } from "react-icons/fa";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Action } from "src/util/constants";
import { HUD } from "../core/HUD";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Tabs } from "../core/Tabs";
import { BrandingLabel } from "../shared/BrandingLabel";
import { AsteroidTarget } from "./AsteroidTarget";
import { Blueprints } from "./Blueprints";
import { CurrentObjective } from "./CurrentObjective";
import { HoverInfo } from "./HoverInfo";
import { Profile } from "./Profile";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { Chat as _Chat } from "./chat/Chat";
import { ActiveMarker } from "./markers/ActiveMarker";
import { HomeMarker } from "./markers/HomeMarker";
import HackerConsole from "./modals/HackerConsole";
import { OwnedAsteroids } from "./panes/OwnedAsteroids";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";
import { MenuButtons } from "./MenuButtons";
import { MapButton } from "./MapButton";
import { SpectatingDetails } from "./SpectatingDetails";
import { PinnedPane } from "../core/PinnedPane";
import { Card } from "../core/Card";

export const GameHUD = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const isSpectating = ownedBy !== playerEntity;
  const uiScale = useSettingsStore((state) => state.uiScale);

  const allowHackerModal = useSettingsStore((state) => state.allowHackerModal);
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  return (
    <div className="screen-container font-mono">
      <HUD scale={uiScale}>
        {/* MARKERS */}
        <ActiveMarker />
        <HomeMarker />

        <AsteroidTarget />

        <PinnedPane id="test" title="test" coord={{ x: 0, y: 0 }} scene={Scenes.Asteroid}>
          <Card className="p-2">test</Card>
        </PinnedPane>

        <HUD.CursorFollower>
          <HoverInfo />
        </HUD.CursorFollower>
        <HUD.TopLeft>
          <div className="flex">
            <Profile />
            <MenuButtons />
          </div>
        </HUD.TopLeft>

        <HUD.TopMiddle>
          <MapButton isSpectating={isSpectating} />
        </HUD.TopMiddle>

        {!isSpectating && (
          <HUD.TopRight>
            {
              <div className="flex flex-col">
                <CurrentObjective />
              </div>
            }
          </HUD.TopRight>
        )}

        {!isSpectating && <HUD.Right>{mapOpen ? <Asteroids /> : <BuildingSelection />}</HUD.Right>}
        {isSpectating && (
          <HUD.TopRight>
            <p className="text-accent text-2xl font-bold p-5 flex gap-2 items-center">
              <FaCircle size={12} className="animate-pulse text-error" />
              LIVE
            </p>
          </HUD.TopRight>
        )}

        <HUD.Left>
          <Chat />
          <Modal title="hacker console" keybind={allowHackerModal ? KeybindActions.Console : undefined} keybindClose>
            <Modal.Content className="w-4/5 h-[40rem]">
              <HackerConsole />
            </Modal.Content>
          </Modal>
        </HUD.Left>

        <HUD.BottomLeft>
          {!isSpectating && <SpacerockMenu />}
          {isSpectating && !mapOpen && <SpectatingDetails />}
        </HUD.BottomLeft>
      </HUD>

      <HUD>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
    </div>
  );
};

const BuildingSelection = () => {
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const action = components.SelectedAction.use()?.value;
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
  } = primodium.api();
  const keybinds = useKeybinds();

  return (
    <>
      {(!selectedBuilding || action === Action.PlaceBuilding) && (
        <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
          <Tabs.Button
            index={0}
            togglable
            keybind={KeybindActions.Blueprint}
            onClick={() => {
              components.SelectedBuilding.remove();
              components.SelectedAction.remove();
            }}
            className="rounded-r-none m-0 border-r-0 btn-md border-warning relative py-4 hover:text-accent group"
          >
            <IconLabel imageUri="img/icons/blueprinticon.png" className="text-2xl scale-125 " />
            <p
              style={{
                writingMode: "vertical-rl",
                textOrientation: "sideways",
              }}
              className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
            >
              blueprints
            </p>

            <div className="absolute kbd kbd-xs bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
              {KeyNames[keybinds[KeybindActions.Blueprint]?.entries().next().value[0]] ??
                keybinds[KeybindActions.Blueprint]?.entries().next().value[0]}
            </div>
          </Tabs.Button>

          <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 overflow-y-visible relative">
            <Blueprints />
          </Tabs.Pane>
        </Tabs>
      )}
      {selectedBuilding && (!action || action === Action.MoveBuilding) && (
        <Tabs className="flex flex-row justify-center items-center gap-0">
          <Tabs.Button
            index={0}
            togglable
            onClick={() => components.SelectedBuilding.remove()}
            className="rounded-r-none m-0 border-r-0 btn-md border-accent relative hover:text-accent group"
          >
            <FaArrowRight />
          </Tabs.Button>

          <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 overflow-y-visible">
            <BuildingMenu />
          </Tabs.Pane>
        </Tabs>
      )}
    </>
  );
};

const Asteroids = () => {
  return (
    <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
      <Tabs.Button
        index={0}
        togglable
        className="rounded-r-none m-0 border-r-0 btn-md border-warning relative py-4 hover:text-accent group"
      >
        <IconLabel imageUri="img/icons/asteroidicon.png" className="text-2xl" />
        <p
          style={{
            writingMode: "vertical-rl",
            textOrientation: "sideways",
          }}
          className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
        >
          asteroids
        </p>
      </Tabs.Button>
      <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 h-[400px] w-[350px] overflow-x-hidden">
        <OwnedAsteroids />
      </Tabs.Pane>
    </Tabs>
  );
};

const Chat = () => {
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
  } = primodium.api()!;
  const keybinds = useKeybinds();

  return (
    <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
      <Tabs.Pane index={0} className="rounded-l-none border-l-0 z-10">
        <_Chat />
      </Tabs.Pane>
      <Tabs.Button
        index={0}
        togglable
        keybind={KeybindActions.Chat}
        className="rounded-l-none m-0 border-l-0 btn-md border-secondary relative py-4 hover:text-accent group"
      >
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
        <div className="absolute kbd kbd-xs bottom-0 right-0 translate-x-1/2 translate-y-1/2">
          {KeyNames[keybinds[KeybindActions.Chat]?.entries().next().value[0]] ??
            keybinds[KeybindActions.Chat]?.entries().next().value[0]}
        </div>
      </Tabs.Button>
    </Tabs>
  );
};
