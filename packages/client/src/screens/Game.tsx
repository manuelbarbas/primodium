import { useEffect, useState } from "react";
import { useMud } from "src/hooks/useMud";

import { usePlayerAsteroids } from "@/hooks/usePlayerAsteroids";
import { YouDied } from "@/screens/YouDied";
import { PrimodiumGame, initGame } from "@game/api";
import { Progress } from "src/components/core/Progress";
import { GameProvider } from "src/hooks/providers/GameProvider";
import { GameHUD } from "@/components/hud";
import { WidgetProvider } from "src/hooks/providers/WidgetProvider";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const mud = useMud();
  const [game, setGame] = useState<PrimodiumGame | null>(null);

  const destroy = async () => {
    if (game === null) return;
    setGame(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    game?.destroy();
    const phaserContainer = document.getElementById("phaser-container");
    for (const child of Array.from(phaserContainer?.children ?? [])) {
      phaserContainer?.removeChild(child);
    }
  };

  const init = async () => {
    try {
      await destroy();
      const pri = await initGame(params.get("version") ? params.get("version")! : "🔥");
      setGame(pri);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!game) return;
    game.runSystems(mud);
  }, [mud, game]);

  useEffect(() => {
    init();

    return () => {
      destroy();
    };
  }, []);

  const isDead = usePlayerAsteroids(mud.playerAccount.entity).length === 0;
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
              <WidgetProvider>
                {isDead && <YouDied />} <GameHUD />
              </WidgetProvider>
            </GameProvider>
          )}
        </div>
      </div>
    </div>
  );
};
