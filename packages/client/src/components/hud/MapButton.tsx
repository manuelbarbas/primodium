import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useMemo } from "react";
import { Entity } from "@latticexyz/recs";

import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { useMud } from "src/hooks";
import { SecondaryCard } from "../core/Card";

export const MapButton = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;
  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const primodium = usePrimodium();
  const { transitionToScene } = primodium.api().scene;

  const isSpectating = useMemo(() => ownedBy !== playerEntity, [ownedBy, playerEntity]);

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

  useEffect(() => {
    const starmapListener = primodium.api(Scenes.Starmap).input.addListener(KeybindActions.Map, closeMap);

    const asteroidListener = primodium.api(Scenes.Asteroid).input.addListener(KeybindActions.Map, openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, []);

  return (
    <SecondaryCard>
      <Button
        className={`flex btn-sm !p-3 !px-10 gap-5 border border-secondary border-dotted filter drop-shadow-hard ${
          !mapOpen ? "btn-error star-background-sm" : "btn-black"
        }`}
        clickSound={AudioKeys.Sequence}
        onClick={!mapOpen ? openMap : closeMap}
      >
        {!mapOpen && !isSpectating && <IconLabel imageUri="/img/icons/starmapicon.png" className="text-xl" />}
        {!mapOpen && isSpectating && <IconLabel imageUri="/img/icons/returnicon.png" className="text-xl" />}
        {mapOpen && <IconLabel imageUri="/img/icons/minersicon.png" className="text-xl" />}
        <p className="uppercase">
          {!mapOpen ? (isSpectating ? "stop spectating >" : "open star map >") : "Return to building >"}
        </p>
      </Button>
    </SecondaryCard>
  );
};
