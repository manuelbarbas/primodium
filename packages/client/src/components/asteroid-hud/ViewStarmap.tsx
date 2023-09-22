import { useEffect } from "react";
import { Button } from "../core/Button";
import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";
import { MapOpen } from "src/network/components/clientComponents";
import { SingletonID } from "@latticexyz/network";

export const ViewStarmap = () => {
  const mapOpen = MapOpen.use(SingletonID, {
    value: false,
  }).value;
  const { transitionToScene } = primodium.api().scene;

  const closeMap = async () => {
    await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
    MapOpen.set({ value: false });
  };

  const openMap = async () => {
    await transitionToScene(Scenes.Asteroid, Scenes.Starmap, 0);
    MapOpen.set({ value: true });
  };

  useEffect(() => {
    const starmapListener = primodium
      .api(Scenes.Starmap)
      .input.addListener(KeybindActions.Map, closeMap);

    const asteroidListener = primodium
      .api(Scenes.Asteroid)
      .input.addListener(KeybindActions.Map, openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, []);

  return (
    <Button
      className="w-full flex gap-2 btn-warning bg-gradient-to-br from-rose-700 to-pink-600 border-2 ring-2 ring-error/30 border-rose-900 drop-shadow-2xl text-base-content pixel-images"
      onClick={mapOpen ? closeMap : openMap}
    >
      <img
        src="img/icons/attackaircraft.png"
        className="pixel-images w-8 h-8"
      />
      <span className="flex font-bold gap-1">
        {!mapOpen ? "OPEN STAR MAP" : "CLOSE STAR MAP"}
      </span>
    </Button>
  );
};
