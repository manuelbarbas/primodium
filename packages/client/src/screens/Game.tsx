import { useEffect, useState } from "react";
import { primodium } from "../game";
import GameUI from "../components/GameUI";
import { useMud } from "../context/MudContext";
import { useAccount } from "src/hooks/useAccount";
import { Tour } from "src/components/tour/Tour";
import { useTourStore } from "src/store/TourStore";
import { EntityID } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const network = useMud();
  const { world, components, singletonIndex } = useMud();
  const { address } = useAccount();
  const [completedTutorial, checkpoint] = useTourStore((state) => [
    state.completedTutorial,
    state.checkpoint,
  ]);

  // resourceKey of the entity
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  useEffect(() => {
    (async () => {
      try {
        if (!network) return;
        await primodium.init(
          address,
          network,
          params.get("version") ? params.get("version")! : "🔥"
        );

        //set game resolution here to prevent initial incorrect scaling problems
        // ex: https://cdn.discordapp.com/attachments/1101613209477189726/1126541021984067674/cd2a378e890959432c098c2382e4dc49.png
        primodium.game.setResolution(
          window.innerWidth * window.devicePixelRatio,
          window.innerHeight * window.devicePixelRatio
        );

        setReady(true);
      } catch (e) {
        console.log(e);
        setError(true);
      }
    })();
  }, [network]);

  useEffect(() => {
    if (ready && mainBaseCoord) {
      primodium.camera.pan(mainBaseCoord, 0);
      primodium.components.selectedTile(network).set(mainBaseCoord);
    }
  }, [mainBaseCoord, ready]);

  if (error) {
    return <div>Phaser Engine Game Error. Refer to console.</div>;
  }

  //check if player has mainbase and checkpoint is null
  const playerInitialized = mainBaseCoord && checkpoint === null;

  return (
    <div>
      {!ready && (
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
        className={`${ready ? "opacity-100" : "opacity-0"}`}
      >
        {!playerInitialized && !completedTutorial && <Tour />}
        <div id="phaser-container" className="absolute cursor-pointer" />
        <GameUI />
      </div>
    </div>
  );
};
