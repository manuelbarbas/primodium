import { KeybindActions } from "@game/constants";
import { FaCircle } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { HUD } from "../core/HUD";
import { Modal } from "../core/Modal";
import { BrandingLabel } from "../shared/BrandingLabel";
import { CurrentObjective } from "./CurrentObjective";
import { MapButton } from "./MapButton";
import { MenuButtons } from "./MenuButtons";
import { Profile } from "./Profile";
import { SpectatingDetails } from "./SpectatingDetails";
import { HoverInfo } from "./hover/HoverInfo";
import { BuildMarker } from "./markers/BuildMarker";
import { HomeMarker } from "./markers/HomeMarker";
import HackerConsole from "./modals/HackerConsole";
import { Blueprints } from "./panes/blueprints/Blueprints";
import { Resources } from "./panes/resources/Resources";
import { AsteroidTarget } from "./starmap/AsteroidTarget";
import { FleetTarget } from "./starmap/FleetTarget";
import { HoverTarget } from "./starmap/HoverTarget";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { OwnedAsteroids } from "./panes/OwnedAsteroids";

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
    <div className={`screen-container font-mono`}>
      <HUD scale={uiScale}>
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
            <div className="mr-2 space-y-2">
              <CurrentObjective />
              <OwnedAsteroids />
              <Resources />
              <Blueprints />
            </div>
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
        <HUD.BottomRight></HUD.BottomRight>

        <HUD.BottomMiddle>
          <BuildingMenu />
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
