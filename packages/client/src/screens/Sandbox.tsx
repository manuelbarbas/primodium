import { useEffect, useState } from "react";

import { useCore } from "@primodiumxyz/core/react";
import { initGame, PrimodiumGame } from "@primodiumxyz/game";
import { _Sandbox } from "@/components/_Sandbox";
import { Progress } from "@/components/core/Progress";
import { GameProvider } from "@/hooks/providers/GameProvider";

const params = new URLSearchParams(window.location.search);

export const Sandbox = () => {
  const mud = useCore();

  const [game, setGame] = useState<PrimodiumGame | null>(null);

  useEffect(() => {
    if (!game) return;
    game.runSystems();
  }, [mud, game]);

  useEffect(() => {
    (async () => {
      try {
        const pri = await initGame(mud, params.get("version") ? params.get("version")! : "🔥");
        setGame(pri);
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      game?.destroy();
    };
  }, []);

  return (
    <div>
      {!game && (
        <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
          <p className="text-lg text-white">
            <span className="">Loading game</span>
            <span>&hellip;</span>
          </p>
          <Progress value={100} max={100} className="animate-pulse w-56" />
        </div>
      )}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div id="game-container relative">
        <div id="phaser-container" className="cursor-pointer screen-container">
          {!!game && (
            <GameProvider {...game}>
              <_Sandbox />
            </GameProvider>
          )}
        </div>
      </div>
    </div>
  );
};
