import { primodium } from "@game/api";
import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useEffect } from "react";
import { FaCaretUp, FaCrosshairs } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Button } from "../core/Button";
import { Join } from "../core/Join";

export const SelectAction = () => {
  const mud = useMud();
  const playerEntity = mud.network.playerEntity;
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const { transitionToScene } = primodium.api().scene;
  const spectatingAccount = components.SpectateAccount.use()?.value;

  const closeMap = async () => {
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
    components.MapOpen.set({ value: false });
  };

  const openMap = async () => {
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
    components.SpectateAccount.set({ value: playerEntity });
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
      {/* {mapOpen && (
        <div className="flex flex-col items-center gap-2">
          <Button
            className="w-full flex gap-2 btn-secondary bg-gradient-to-br from-cyan-700 to-cyan-800 border-2  border-accent drop-shadow-2xl text-base-content pixel-images group overflow-hidden"
            clickSound={AudioKeys.Sequence2}
            onClick={closeMap}
          >
            <img src="img/icons/asteroidicon.png" className="pixel-images w-8 h-8" />
            <span className="flex font-bold gap-1">CLOSE STAR MAP</span>
          </Button>
          <Button
            className="btn-sm flex border border-secondary"
            onClick={() => {
              const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;
              //TODO - fix entity conversion
              const homeAsteroid = components.Home.get(mud.network.playerEntity)?.asteroid as Entity | undefined;
              // Send.setDestination(homeAsteroid);
              const coord = components.Position.get(homeAsteroid) ?? { x: 0, y: 0 };
              pan(coord);
              zoomTo(2);
            }}
          >
            <FaCrosshairs /> HOME
          </Button>
        </div>
      )} */}
      <Join className="border-b border-x border-secondary rounded-t-none">
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={closeMap}
          className={`relative rounded-t-none rounded-r-none ${mapOpen ? "opacity-75" : "ring ring-accent z-10"}`}
        >
          <div className="flex flex-col gap-2 items-center p-2">
            <img src="img/icons/minersicon.png" className="pixel-images w-12 h-12" />
            <p className="">BUILD</p>
          </div>
          {!mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
        <Button
          clickSound={AudioKeys.Sequence}
          onClick={openMap}
          className={`rounded-t-none rounded-l-none ${!mapOpen ? "opacity-75" : "ring ring-accent z-10"}`}
        >
          <div className="flex flex-col gap-2 items-center p-2">
            <img src="img/icons/starmapicon.png" className="pixel-images w-12 h-12" />
            <p className="">EXPAND</p>
          </div>
          {mapOpen && <FaCaretUp size={22} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-accent" />}
        </Button>
      </Join>
    </div>
  );
};
