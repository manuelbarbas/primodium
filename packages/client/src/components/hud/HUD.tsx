import { KeybindActions } from "@game/constants";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { components } from "src/network/components";
import { HUD } from "../core/HUD";
import { Modal } from "../core/Modal";
import { BrandingLabel } from "../shared/BrandingLabel";
import { CurrentObjective } from "./CurrentObjective";
import { Profile } from "./Profile";
// import { SpectatingDetails } from "./SpectatingDetails";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { HoverInfo } from "./hover/HoverInfo";
import { HoverTarget } from "./markers/HoverTarget";
import { AsteroidTarget } from "./markers/starmap/AsteroidTarget";
import { BuildMarker } from "./markers/starmap/BuildMarker";
import { FleetTarget } from "./markers/starmap/FleetTarget";
import { HomeMarker } from "./markers/starmap/HomeMarker";
import HackerConsole from "./modals/HackerConsole";
import { Companion } from "./companion/Companion";
import { WidgetProvider } from "src/hooks/providers/WidgetProvider";
import { OwnedAsteroids } from "./panes/OwnedAsteroids";
import { OwnedFleets } from "./panes/OwnedFleets";
import { Blueprints } from "./panes/blueprints/Blueprints";
import { Resources } from "./panes/resources/Resources";
import { Hangar } from "./panes/hangar/Hangar";
import { Chat } from "./panes/chat/Chat";

export const GameHUD = () => {
  const uiScale = usePersistentStore((state) => state.uiScale);

  const allowHackerModal = usePersistentStore((state) => state.allowHackerModal);
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  return (
    <div className={`screen-container`}>
      <WidgetProvider>
        <HUD scale={uiScale} pad>
          {/* Make map look inset */}
          {mapOpen && (
            <>
              <div className="absolute inset-0 border-8 blur-lg border-secondary/25" />
              <div className="absolute inset-0 scale-[98%] border-8 blur-lg border-info/25" />
            </>
          )}

          <Modal title="hacker console" keybind={allowHackerModal ? KeybindActions.Console : undefined} keybindClose>
            <Modal.Content className="w-4/5 h-[40rem]">
              <HackerConsole />
            </Modal.Content>
          </Modal>

          {/* MARKERS */}
          <BuildMarker />
          <HomeMarker />
          <AsteroidTarget />
          <FleetTarget />
          <HoverTarget />

          {/* Widgets */}
          <HUD.TopLeft>
            <Profile />
          </HUD.TopLeft>
          <HUD.Left>
            <Blueprints />
          </HUD.Left>

          <Resources />
          <Hangar />

          <HUD.TopRight className="flex flex-col items-end gap-2">
            <CurrentObjective />
            <OwnedAsteroids />
            <OwnedFleets />
          </HUD.TopRight>

          <HUD.BottomRight>
            <Chat />
          </HUD.BottomRight>

          <HUD.CursorFollower>
            <HoverInfo />
          </HUD.CursorFollower>

          {/* <HUD.BottomLeft>{isSpectating && !mapOpen && <SpectatingDetails />}</HUD.BottomLeft> */}

          <HUD.BottomLeft>
            <Companion />
          </HUD.BottomLeft>

          <HUD.BottomMiddle>
            <BuildingMenu />
          </HUD.BottomMiddle>
        </HUD>

        <HUD>
          <HUD.BottomRight>
            <BrandingLabel />
          </HUD.BottomRight>
        </HUD>
      </WidgetProvider>
    </div>
  );
};
