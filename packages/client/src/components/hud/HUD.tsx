import { memo } from "react";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { useShallow } from "zustand/react/shallow";
import { HUD } from "@/components/core/HUD";
import { Modal } from "@/components/core/Modal";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { AsteroidLoading } from "@/components/hud/AsteroidLoading";
import { Profile } from "@/components/hud/Profile";
import { HoverInfo } from "./hover/HoverInfo";
import { HoverTarget } from "@/components/hud/markers/HoverTarget";
import { BlueprintInfoMarker } from "@/components/hud/markers/asteroid/BlueprintInfoMarker";
import { BuildingMenuPopup } from "@/components/hud/markers/asteroid/BuildingMenuPopup";
import { AsteroidTarget } from "@/components/hud/markers/starmap/AsteroidTarget";
import { BuildMarker } from "@/components/hud/markers/starmap/BuildMarker";
import { FleetTarget } from "@/components/hud/markers/starmap/FleetTarget";
import { HomeMarker } from "@/components/hud/markers/starmap/HomeMarker";
import { HackerConsole } from "@/components/hud/modals/HackerConsole";
import { OwnedAsteroids } from "@/components/hud/widgets/OwnedAsteroids";
import { OwnedFleets } from "@/components/hud/widgets/OwnedFleets";
import { Blueprints } from "@/components/hud/widgets/blueprints/Blueprints";
import { Chat } from "@/components/hud/widgets/chat/Chat";
import { Hangar } from "@/components/hud/widgets/hangar/Hangar";
import { Resources } from "@/components/hud/widgets/resources/Resources";
import { UnitDeaths } from "@/components/hud/widgets/UnitDeaths";
import { Dock } from "@/components/hud/Dock";
import { ModeSelector } from "@/components/hud/ModeSelector";

export const GameHUD = memo(() => {
  const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
  const allowHackerModal = usePersistentStore(useShallow((state) => state.allowHackerModal));

  return (
    <div className={`screen-container`}>
      <HUD scale={uiScale}>
        <Modal title="hacker console" keybind={allowHackerModal ? "Console" : undefined} keybindClose>
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
        <BuildingMenuPopup />
        <BlueprintInfoMarker />

        {/* Widgets */}
        <HUD.TopLeft className="flex flex-col gap-2">
          <Profile />
          <UnitDeaths />
        </HUD.TopLeft>

        <HUD.TopMiddle className="flex flex-col items-center gap-2">
          <ModeSelector />
        </HUD.TopMiddle>
        <HUD.TopRight className="flex flex-col items-end gap-2">
          <Hangar />
          <OwnedAsteroids />
          <OwnedFleets />
        </HUD.TopRight>

        <HUD.Right>
          <Resources />
        </HUD.Right>

        <HUD.Left>
          <Blueprints />
        </HUD.Left>

        <HUD.BottomMiddle>
          <Dock />
        </HUD.BottomMiddle>
        <HUD.BottomRight>
          <Chat />
        </HUD.BottomRight>
      </HUD>
      <HUD>
        <HUD.CursorFollower>
          <HoverInfo />
        </HUD.CursorFollower>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
      <AsteroidLoading />
    </div>
  );
});
