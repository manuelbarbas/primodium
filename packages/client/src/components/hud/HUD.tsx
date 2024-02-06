import { KeybindActions } from "@game/constants";
import { FaCircle } from "react-icons/fa";
import { usePersistantStore } from "src/game/stores/PersistantStore";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { HUD } from "../core/HUD";
import { Modal } from "../core/Modal";
import { BrandingLabel } from "../shared/BrandingLabel";
import { CurrentObjective } from "./CurrentObjective";
import { MapButton } from "./MapButton";
import { Profile } from "./Profile";
import { MenuButtons } from "./MenuButtons";
import { SpectatingDetails } from "./SpectatingDetails";
import { Resources } from "./panes/resources/Resources";
import { Blueprints } from "./panes/blueprints/Blueprints";
import { HoverInfo } from "./hover/HoverInfo";
import { ActiveMarker } from "./markers/ActiveMarker";
import { HomeMarker } from "./markers/HomeMarker";
import HackerConsole from "./modals/HackerConsole";
import { AsteroidTarget } from "./starmap/AsteroidTarget";
import { FleetTarget } from "./starmap/FleetTarget";
import { HoverTarget } from "./starmap/HoverTarget";

export const GameHUD = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const selectedRock = components.SelectedRock.use()?.value;
  const ownedBy = components.OwnedBy.use(selectedRock)?.value;
  const isSpectating = ownedBy !== playerEntity;
  const uiScale = usePersistantStore((state) => state.uiScale);

  const allowHackerModal = usePersistantStore((state) => state.allowHackerModal);
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  return (
    <div className="screen-container font-mono">
      <HUD scale={uiScale}>
        <Modal title="hacker console" keybind={allowHackerModal ? KeybindActions.Console : undefined} keybindClose>
          <Modal.Content className="w-4/5 h-[40rem]">
            <HackerConsole />
          </Modal.Content>
        </Modal>

        {/* MARKERS */}
        <ActiveMarker />
        <HomeMarker />

        <AsteroidTarget />
        <FleetTarget />
        <HoverTarget />

        {/* GAME PANES */}
        <Resources />
        <Blueprints />

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

        {isSpectating && (
          <HUD.TopRight>
            <p className="text-accent text-2xl font-bold p-5 flex gap-2 items-center">
              <FaCircle size={12} className="animate-pulse text-error" />
              LIVE
            </p>
          </HUD.TopRight>
        )}

        <HUD.BottomLeft>{isSpectating && !mapOpen && <SpectatingDetails />}</HUD.BottomLeft>
      </HUD>

      <HUD>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
    </div>
  );
};
