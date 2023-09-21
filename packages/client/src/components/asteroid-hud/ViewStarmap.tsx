import { useCallback, useEffect, useState } from "react";
import { Button } from "../core/Button";
import { primodium } from "@game/api";
import { KeybindActions, Scenes } from "@game/constants";

export const ViewStarmap = () => {
  const [mapOpen, setMapOpen] = useState(false);
  const { transitionToScene } = primodium.api().scene;

  const handleTransition = useCallback(async () => {
    if (mapOpen)
      await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0, () =>
        setMapOpen(false)
      );
    else
      await transitionToScene(Scenes.Asteroid, Scenes.Starmap, 0, () =>
        setMapOpen(true)
      );
  }, [mapOpen, transitionToScene]);

  useEffect(() => {
    const listener = mapOpen
      ? primodium
          .api(Scenes.Starmap)
          .input.addListener(KeybindActions.Map, handleTransition)
      : primodium
          .api(Scenes.Asteroid)
          .input.addListener(KeybindActions.Map, handleTransition);

    return () => {
      listener.dispose();
    };
  }, [mapOpen]);

  return (
    <Button
      className="w-full flex gap-2 btn-warning bg-gradient-to-br from-rose-700 to-pink-600 border-2 ring-2 ring-error/30 border-rose-900 drop-shadow-2xl text-base-content pixel-images"
      onClick={handleTransition}
    >
      <img
        src="img/icons/attackaircraft.png"
        className="pixel-images w-8 h-8"
      />
      <span className="flex font-bold gap-1">OPEN STAR MAP</span>
    </Button>
  );
};
