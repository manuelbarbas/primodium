import { primodium } from "@game/api";
import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect } from "react";
import { FaCaretUp } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Button } from "../core/Button";
import { Join } from "../core/Join";

export const SelectAction: React.FC<{ isSpectating: boolean }> = ({ isSpectating }) => {
  const mud = useMud();
  const playerEntity = mud.network.playerEntity;
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const { transitionToScene } = primodium.api().scene;
  const homeAsteroid = components.Home.use(playerEntity)?.asteroid as Entity | undefined;

  const closeMap = async () => {
    if (!mapOpen) return;
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
          onComplete: () => {
            requestAnimationFrame(() => targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView));
          },
        });
        targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
      }
    );
    components.SelectedRock.set({ value: homeAsteroid ?? singletonEntity });
    components.MapOpen.set({ value: false });
  };

  const openMap = async () => {
    if (mapOpen) return;
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
          onComplete: () => {
            requestAnimationFrame(() => targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView));
          },
        });
        targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
      }
    );
    components.MapOpen.set({ value: true });
    components.ActiveRock.set({ value: homeAsteroid ?? singletonEntity });
    components.SelectedBuilding.remove();
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
    <div className="flex z-10">
      <Join className="flex border-b border-x border-secondary rounded-t-none">
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={closeMap}
          className={`flex-1 relative rounded-t-none rounded-r-none ${
            mapOpen ? "opacity-50" : "ring ring-accent z-10"
          }`}
        >
          {isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/minersicon.png" className="pixel-images w-12 h-12" />
              <p className="">SPECTATE</p>
            </div>
          )}
          {!isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/minersicon.png" className="pixel-images w-12 h-12" />
              <p className="">BUILD</p>
            </div>
          )}
          {!mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={openMap}
          className={`flex-1 rounded-t-none rounded-l-none disabled:opacity-100 ${
            !mapOpen ? "opacity-50" : "ring ring-accent z-10"
          }`}
        >
          {!isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/starmapicon.png" className="pixel-images w-12 h-12" />
              <p className="">CONQUER</p>
            </div>
          )}
          {isSpectating && (
            <div className="flex flex-col gap-2 items-center p-2 w-16">
              <img src="img/icons/starmapicon.png" className="pixel-images w-12 h-12" />
              <p className="">EXIT</p>
            </div>
          )}
          {mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
      </Join>
    </div>
  );
};
