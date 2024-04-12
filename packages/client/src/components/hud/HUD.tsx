import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FC, memo, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { useMud } from "@/hooks";
import { useWidgets } from "@/hooks/providers/WidgetProvider";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { useShallow } from "zustand/react/shallow";
import { HUD } from "@/components/core/HUD";
import { Modal } from "@/components/core/Modal";
import { BrandingLabel } from "@/components/shared/BrandingLabel";
import { AsteroidLoading } from "@/components/hud/AsteroidLoading";
import { CurrentObjective } from "@/components/hud/CurrentObjective";
import { Profile } from "@/components/hud/Profile";
import { Companion } from "@/components/hud/companion/Companion";
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
import { Cheatcodes } from "@/components/hud/widgets/dev/Cheatcodes";
import { Hangar } from "@/components/hud/widgets/hangar/Hangar";
import { Resources } from "@/components/hud/widgets/resources/Resources";
import { UnitDeaths } from "@/components/hud/widgets/UnitDeaths";

export const GameHUD = memo(() => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const {
    camera: { createDOMContainer },
    input: { addListener },
    scene: { transitionToScene },
  } = useRef(primodium.api("UI")).current;

  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const isSpectating = useMemo(() => ownedBy !== playerEntity, [ownedBy, playerEntity]);

  const { widgets } = useWidgets();

  useEffect(() => {
    const hideAllListener = addListener("HideAll", () => {
      const numOpen = widgets.filter((widget) => widget.visible && widget.active).length;
      if (numOpen > 0) widgets.forEach((widget) => widget.close());
      else widgets.forEach((widget) => widget.open());
    });

    const listenerDisposals = widgets.map(({ hotkey, open, close, visible }) => {
      if (!hotkey) return;
      const listener = addListener(hotkey, () => (!visible ? open() : close()));

      return listener.dispose;
    });
    return () => {
      listenerDisposals.forEach((dispose) => dispose && dispose());
      hideAllListener.dispose();
    };
  }, [addListener, widgets]);

  const { closeMap, openMap } = useMemo(() => {
    const closeMap = async () => {
      if (!components.MapOpen.get()?.value) return;
      await transitionToScene(
        "STARMAP",
        "ASTEROID",
        0,
        (_, targetScene) => {
          targetScene.camera.phaserCamera.fadeOut(0, 0, 0, 0);
        },
        (_, targetScene) => {
          targetScene.phaserScene.add.tween({
            targets: targetScene.camera.phaserCamera,
            zoom: { from: 0.5, to: 1 },
            duration: 500,
            ease: "Cubic.easeInOut",
            onUpdate: () => {
              targetScene.camera.zoom$.next(targetScene.camera.phaserCamera.zoom);
              targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView);
            },
          });
          targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
        }
      );
      components.MapOpen.set({ value: false });
      components.SelectedRock.set({ value: components.ActiveRock.get()?.value ?? singletonEntity });
    };

    const openMap = async () => {
      if (components.MapOpen.get()?.value) return;
      const activeRock = components.ActiveRock.get()?.value;
      const position = components.Position.get(activeRock) ?? { x: 0, y: 0 };
      const { pan } = primodium.api("STARMAP").camera;

      pan(position, {
        duration: 0,
      });

      await transitionToScene(
        "ASTEROID",
        "STARMAP",
        0,
        (_, targetScene) => {
          targetScene.camera.phaserCamera.fadeOut(0, 0, 0, 0);
        },
        (_, targetScene) => {
          targetScene.phaserScene.add.tween({
            targets: targetScene.camera.phaserCamera,
            zoom: { from: 2, to: 1 },
            duration: 500,
            ease: "Cubic.easeInOut",
            onUpdate: () => {
              targetScene.camera.zoom$.next(targetScene.camera.phaserCamera.zoom);
              targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView);
            },
          });
          targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
        }
      );
      components.MapOpen.set({ value: true });
      components.SelectedBuilding.remove();
      if (isSpectating)
        components.ActiveRock.set({ value: (components.BuildRock.get()?.value ?? singletonEntity) as Entity });
    };
    return { closeMap, openMap };
  }, [isSpectating, primodium, transitionToScene]);

  useEffect(() => {
    const starmapListener = primodium.api("STARMAP").input.addListener("Map", closeMap);

    const asteroidListener = primodium.api("ASTEROID").input.addListener("Map", openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, [closeMap, openMap, primodium]);

  const PhaserHUD = useMemo(() => {
    const { container, obj } = createDOMContainer("hud", { x: 0, y: 0 });
    obj.pointerEvents = "none";
    obj.transformOnly = true;

    const Portal: FC = memo(() => {
      const uiScale = usePersistentStore(useShallow((state) => state.uiScale));
      const allowHackerModal = usePersistentStore(useShallow((state) => state.allowHackerModal));
      if (!container) return <></>;

      return ReactDOM.createPortal(
        <div className={`screen-container`}>
          <HUD scale={uiScale} pad>
            {/* Make map look inset */}
            {mapOpen && (
              <>
                <div className="absolute inset-0 border-8 blur-lg border-secondary/25" />
                <div className="absolute inset-0 scale-[98%] border-8 blur-lg border-info/25" />
              </>
            )}

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
              <Blueprints />
            </HUD.TopLeft>

            <HUD.TopMiddle className="flex flex-col items-center gap-2">
              <Cheatcodes />
              <UnitDeaths />
            </HUD.TopMiddle>
            <HUD.TopRight className="flex flex-col items-end gap-2">
              <CurrentObjective />
              <Resources />
              <Hangar />
              <OwnedAsteroids />
              <OwnedFleets />
            </HUD.TopRight>

            <HUD.BottomRight>
              <Chat />
            </HUD.BottomRight>

            <HUD.BottomLeft>
              <Companion />
            </HUD.BottomLeft>
          </HUD>
        </div>,
        container
      );
    });

    return Portal;
  }, [createDOMContainer, mapOpen]);

  //align element with phaser elements
  //align element with phaser elements
  return (
    <div className={`screen-container`}>
      <PhaserHUD />
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
