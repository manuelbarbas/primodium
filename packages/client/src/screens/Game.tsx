import { useEffect } from "react";
import { AsteroidHUD } from "src/components/asteroid-hud/AsteroidHUD";
import { useMud } from "src/hooks/useMud";

import { primodium } from "@game/api";
import { GameReady } from "src/network/components/clientComponents";
import { Progress } from "src/components/core/Progress";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const gameReady = GameReady.use()?.value;

  return (
    <div>
      {!gameReady && (
        <div className="flex flex-col items-center justify-center h-screen text-white font-mono gap-2">
          <Progress />
          <div className="text-center">
            <p className="text-lg">Initializing Game World...</p>
          </div>
        </div>
      )}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div id="game-container relative ">
        <PhaserWrapper />
        {gameReady && <AsteroidHUD />}
      </div>
    </div>
  );
};

const PhaserWrapper = () => {
  const network = useMud();

  useEffect(() => {
    (async () => {
      try {
        if (!network) return;

        await primodium.init(
          network,
          params.get("version") ? params.get("version")! : "🔥"
        );
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      primodium.destroy();
      GameReady.set({ value: false });
    };
  }, [network]);

  return (
    <div
      id="phaser-container"
      className="absolute cursor-pointer screen-container"
    />
  );
};
