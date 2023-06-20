import { memo, useEffect } from "react";
import primodium from "../api";
import { useMud } from "../context/MudContext";
import GameUI from "../components/GameUI";
import { GameStatus, Scenes } from "../game/constants";

export const Game = memo(() => {
  const { world } = useMud();
  const status = primodium.hooks.useStatus();

  useEffect(() => {
    primodium.createGame(world);
  }, []);

  useEffect(() => {
    if (status === GameStatus.Ready) {
      primodium.game.camera.pan({ x: 0, y: 0 }, 1);
      primodium
        .getGame()
        ?.scenes[Scenes.Main].camera.phaserCamera.fadeIn(2 * 1000); //TODO: create exposed fade in method with better functionality
    }
  }, [status]);

  if (status === GameStatus.Error) {
    return <div>Phaser Engine Game Error. Refer to console.</div>;
  }

  return (
    <div>
      {status !== GameStatus.Ready && (
        <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Primodium</h1>
            <p className="text-lg">Initializing Game World...</p>
          </div>
        </div>
      )}
      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div
        className={`${
          status === GameStatus.Ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <div id="phaser-container" />
        <GameUI />
      </div>
    </div>
  );
});
