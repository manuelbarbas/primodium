import { KeybindActions, Scenes } from "src/game/lib/mappings";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FC, memo, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useMud } from "src/hooks";
import { useWidgets } from "src/hooks/providers/WidgetProvider";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { useShallow } from "zustand/react/shallow";
import { HUD } from "../core/HUD";
import { Modal } from "../core/Modal";
import { BrandingLabel } from "../shared/BrandingLabel";
import { AsteroidLoading } from "./AsteroidLoading";
import { CurrentObjective } from "./CurrentObjective";
import { Profile } from "./Profile";
import { Companion } from "./companion/Companion";
import { HoverInfo } from "./hover/HoverInfo";
import { HoverTarget } from "./markers/HoverTarget";
import { BlueprintInfoMarker } from "./markers/asteroid/BlueprintInfoMarker";
import { BuildingMenuPopup } from "./markers/asteroid/BuildingMenuPopup";
import { AsteroidTarget } from "./markers/starmap/AsteroidTarget";
import { BuildMarker } from "./markers/starmap/BuildMarker";
import { FleetTarget } from "./markers/starmap/FleetTarget";
import { HomeMarker } from "./markers/starmap/HomeMarker";
import HackerConsole from "./modals/HackerConsole";
import { OwnedAsteroids } from "./panes/OwnedAsteroids";
import { OwnedFleets } from "./panes/OwnedFleets";
import { Blueprints } from "./panes/blueprints/Blueprints";
import { Chat } from "./panes/chat/Chat";
import { Cheatcodes } from "./panes/dev/Cheatcodes";
import { Hangar } from "./panes/hangar/Hangar";
import { Resources } from "./panes/resources/Resources";

export const GameHUD = memo(() => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const {
    camera: { createDOMContainer },
    input: { addListener },
    scene: { transitionToScene },
  } = useRef(primodium.api(Scenes.UI)).current;

  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const isSpectating = useMemo(() => ownedBy !== playerEntity, [ownedBy, playerEntity]);

  const { widgets } = useWidgets();

  useEffect(() => {
    const hideAllListener = addListener(KeybindActions.HideAll, () => {
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
        Scenes.Starmap,
        Scenes.Asteroid,
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
      const { pan } = primodium.api(Scenes.Starmap).camera;

      pan(position, 0);

      await transitionToScene(
        Scenes.Asteroid,
        Scenes.Starmap,
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
    const starmapListener = primodium.api(Scenes.Starmap).input.addListener(KeybindActions.Map, closeMap);

    const asteroidListener = primodium.api(Scenes.Asteroid).input.addListener(KeybindActions.Map, openMap);

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
            <BuildingMenuPopup />
            <BlueprintInfoMarker />

            {/* Widgets */}
            <HUD.TopLeft className="flex flex-col gap-2">
              <Profile />
              <Blueprints />
            </HUD.TopLeft>

            <HUD.TopMiddle className="flex flex-col items-center gap-2">
              <Cheatcodes />
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
