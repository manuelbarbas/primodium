import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect } from "react";
import { Entity } from "@latticexyz/recs";

import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { useMud } from "src/hooks";

export const MapButton: React.FC<{ isSpectating: boolean }> = ({ isSpectating }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const primodium = usePrimodium();
  const { transitionToScene } = primodium.api().scene;

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
      components.ActiveRock.set({ value: (components.Home.get(playerEntity)?.value ?? singletonEntity) as Entity });
  };

  useEffect(() => {
    const starmapListener = primodium.api(Scenes.Starmap).input.addListener(KeybindActions.Map, closeMap);

    const asteroidListener = primodium.api(Scenes.Asteroid).input.addListener(KeybindActions.Map, openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, []);

  return (
    <div className="pl-2 flex flex-col items-center gap-1 drop-shadow-hard group">
      <Button
        className={`rounded-t-none border border-t-0 border-accent btn-sm text-3xl px-10 py-6 ${
          !mapOpen ? "star-background-sm" : "topographic-background-md"
        } group-hover:!border-success`}
        clickSound={AudioKeys.Sequence}
        onClick={!mapOpen ? openMap : closeMap}
      >
        {!mapOpen && !isSpectating && <IconLabel imageUri="/img/icons/starmapicon.png" />}
        {!mapOpen && isSpectating && <IconLabel imageUri="/img/icons/returnicon.png" />}
        {mapOpen && <IconLabel imageUri="/img/icons/minersicon.png" />}
      </Button>
      <p className="font-semibold bg-white/10 group-hover:bg-secondary/20 px-2 uppercase">
        {!mapOpen ? (isSpectating ? "stop spectating" : "star map") : "Return to asteroid"}
      </p>
    </div>
  );
};
