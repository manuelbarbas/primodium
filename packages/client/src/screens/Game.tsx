import { useEffect } from "react";
import AsteroidUI from "src/components/asteroid-ui/GameUI";
import { useAccount } from "src/hooks/useAccount";
import { useMud } from "src/hooks/useMud";

import { primodium } from "@game/api";
import { AsteroidMap } from "@game/constants";
import { useElementSize } from "src/hooks/useElementSize";
import { GameReady } from "src/network/components/clientComponents";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const gameReady = GameReady.use()?.value;

  return (
    <div>
      {!gameReady && (
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="text-center">
            <p className="text-lg">Initializing Game World...</p>
          </div>
        </div>
      )}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div id="game-container">
        <PhaserWrapper />
        {gameReady && <AsteroidUI />}
      </div>
    </div>
  );
};

const PhaserWrapper = () => {
  const network = useMud();
  const { address } = useAccount();
  const [elementRef, { width, height }] = useElementSize();
  const gameReady = GameReady.use()?.value;

  useEffect(() => {
    (async () => {
      try {
        if (!network) return;

        await primodium.init(address, network, params.get("version") ? params.get("version")! : "🔥");
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      primodium.destroy();
      GameReady.set({ value: false });
    };
  }, [network]);

  useEffect(() => {
    if (!width || !height || !gameReady) return;

    const { setResolution } = primodium.api(AsteroidMap.KEY)!.game;

    setResolution(width * window.devicePixelRatio, height * window.devicePixelRatio);
  }, [width, height, gameReady]);

  return <div id="phaser-container" ref={elementRef} className="absolute cursor-pointer screen-container" />;
};
