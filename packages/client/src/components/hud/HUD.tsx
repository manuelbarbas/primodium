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
// import { MenuButtons } from "./MenuButtons";
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
// import { OwnedAsteroids } from "./panes/OwnedAsteroids";
// import { Blueprints } from "./panes/blueprints/Blueprints";
// import { Hangar as HangarComponent } from "./panes/hangar/Hangar";
// import { Resources } from "./panes/resources/Resources";
// import { Chat } from "./panes/chat/Chat";
import { Jarvis } from "./Jarvis";

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

        <HUD.CursorFollower>
          <HoverInfo />
        </HUD.CursorFollower>
        <HUD.TopLeft>
          <Profile />
          <div className="ml-2 space-y-2">
            <div className="flex">
              {/* <Chat /> */}

              {/* <MenuButtons /> */}
            </div>
            {/* <HangarComponent /> */}
          </div>
        </HUD.TopLeft>

        {/* <HUD.TopMiddle>
          
        </HUD.TopMiddle> */}

        {!isSpectating && (
          <HUD.TopRight>
            <MapButton isSpectating={isSpectating} />
            {/* <CurrentObjective /> */}
            {/* <OwnedAsteroids /> */}
            {/* <Resources /> */}
            {/* <Blueprints /> */}
            {/* <Chat /> */}
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

        {/* <HUD.BottomLeft>{isSpectating && !mapOpen && <SpectatingDetails />}</HUD.BottomLeft> */}

        <HUD.BottomLeft>
          <Jarvis />
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
    </div>
  );
};
