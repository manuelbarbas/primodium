import { KeybindActions } from "@game/constants";
import { FaCircle } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { HUD } from "../core/HUD";
import { Modal } from "../core/Modal";
import { BrandingLabel } from "../shared/BrandingLabel";
// import { CurrentObjective } from "./CurrentObjective";
import { MapButton } from "./MapButton";
import { MenuButtons } from "./MenuButtons";
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
import { Resources } from "./panes/resources/Resources";
import { Hangar } from "./panes/hangar/Hangar";

export const GameHUD = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const isSpectating = ownedBy !== playerEntity;
  const uiScale = usePersistentStore((state) => state.uiScale);

  const allowHackerModal = usePersistentStore((state) => state.allowHackerModal);
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  return (
    <div className={`screen-container`}>
      <WidgetProvider>
        <HUD scale={uiScale} pad>
          {/* register widgets */}
          <Resources />
          <Hangar />

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

          <HUD.CursorFollower>
            <HoverInfo />
          </HUD.CursorFollower>
          <HUD.TopLeft>
            <div className="flex items-center">
              <Profile />
              <MenuButtons />
            </div>
          </HUD.TopLeft>

          <HUD.TopRight>
            <MapButton isSpectating={isSpectating} />
          </HUD.TopRight>

          {isSpectating && (
            <HUD.BottomRight>
              <p className="text-accent text-2xl font-bold p-5 flex gap-2 items-center">
                <FaCircle size={12} className="animate-pulse text-error" />
                LIVE
              </p>
            </HUD.BottomRight>
          )}

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
