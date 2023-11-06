import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useEffect } from "react";
import { FaCrosshairs } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Button } from "../core/Button";

export const ViewStarmap = () => {
  const mud = useMud();
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;
  const { transitionToScene } = primodium.api().scene;

  const closeMap = async () => {
    await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
    components.MapOpen.set({ value: false });
  };

  const openMap = async () => {
    await transitionToScene(Scenes.Asteroid, Scenes.Starmap, 0);
    components.MapOpen.set({ value: true });
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
    <>
      {mapOpen && (
        <div className="flex flex-col items-center gap-2">
          <Button
            className="w-full flex gap-2 btn-secondary bg-gradient-to-br from-cyan-700 to-cyan-800 border-2  border-accent drop-shadow-2xl text-base-content pixel-images group overflow-hidden"
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
      )}
      {!mapOpen && (
        <Button
          className="w-full flex gap-2 btn-warning bg-gradient-to-br from-rose-700 to-pink-600 border-2 ring-2 ring-error/30 border-rose-900 drop-shadow-2xl text-base-content pixel-images group overflow-hidden"
          onClick={openMap}
        >
          <span className="absolute bg-orange-400/50 -right-96 -bottom-0 group-hover:-right-16 group-hover:bottom-0 h-32 w-32 rounded-full mix-blend-overlay transition-all duration-200" />
          <img src="img/icons/starmapicon.png" className="pixel-images w-8 h-8" />
          <span className="flex font-bold gap-1">OPEN STAR MAP</span>
        </Button>
      )}
    </>
  );
};
