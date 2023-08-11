import { useEffect } from "react";
import AsteroidUI from "src/components/asteroid-ui/GameUI";
import { useMud } from "src/hooks/useMud";
import { useAccount } from "src/hooks/useAccount";

import { primodium } from "@game/api";
import { GameReady } from "src/network/components/clientComponents";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const gameReady = GameReady.use()?.value;
  console.log("game ready:", gameReady);

  return (
    <div>
      {!gameReady && (
        <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Primodium</h1>
            <p className="text-lg">Initializing Game World...</p>
          </div>
        </div>
      )}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div
        id="game-container"
        style={{
          backgroundSize: `75px 75px`,
          backgroundImage: "url(/img/backgrounds/star.webp)",
        }}
      >
        <PhaserWrapper />
        {gameReady && <AsteroidUI />}
      </div>
    </div>
  );
};

const PhaserWrapper = () => {
  const network = useMud();
  const { address } = useAccount();

  useEffect(() => {
    (async () => {
      try {
        if (!network) return;

        await primodium.init(
          address,
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

  return <div id="phaser-container" className="absolute cursor-pointer" />;
};
