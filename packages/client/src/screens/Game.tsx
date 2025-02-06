import { memo, useEffect, useRef, useState } from "react";

import { Keys } from "@primodiumxyz/core";
import { useAccountClient, useCore, usePlayerAsteroids, useSyncStatus } from "@primodiumxyz/core/react";
import { initGame, PrimodiumGame } from "@primodiumxyz/game";
import { Progress } from "@/components/core/Progress";
import { GameHUD } from "@/components/hud";
import { GameProvider } from "@/hooks/providers/GameProvider";
import { WidgetProvider } from "@/hooks/providers/WidgetProvider";
import { useContractCalls } from "@/hooks/useContractCalls";
import { BackgroundParallaxEffect } from "@/screens/BackgroundParallaxEffect";
import { CommandBackgroundEffect } from "@/screens/CommandBackgroundEffect";
import { YouDied } from "@/screens/YouDied";

const params = new URLSearchParams(window.location.search);

export const Game = memo(() => {
  const core = useCore();
  const calls = useContractCalls();
  const {
    playerAccount: { entity },
  } = useAccountClient();
  const [game, setGame] = useState<PrimodiumGame | null>(null);
  const { loading: loadingSecondaryData } = useSyncStatus(Keys.SECONDARY);
  const gameRef = useRef<PrimodiumGame | null>(null);

  const destroy = async () => {
    if (gameRef.current === null) return;
    gameRef.current.destroy();
    gameRef.current = null;
    setGame(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const phaserContainer = document.getElementById("phaser-container");
    for (const child of Array.from(phaserContainer?.children ?? [])) {
      phaserContainer?.removeChild(child);
    }
  };

  const init = async () => {
    try {
      destroy();
      const pri = await initGame(core, calls, params.get("version") ? params.get("version")! : "🔥");
      gameRef.current = pri;
      setGame(pri);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!game) return;
    game.runSystems().primary();
  }, [core, game]);

  useEffect(() => {
    if (!game || loadingSecondaryData) return;
    const { secondary, done } = game.runSystems();
    secondary();
    done();
  }, [core, game, loadingSecondaryData]);

  useEffect(() => {
    init();

    return () => {
      gameRef.current?.destroy();
    };
  }, []);

  const isDead = usePlayerAsteroids(entity).length === 0;

  return (
    <div>
      {!game && (
        <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
          <p className="text-lg text-white">
            <span className="">Loading game</span>
            <span>&hellip;</span>
          </p>
          <Progress value={100} max={100} variant="secondary" className="animate-pulse w-56" />
        </div>
      )}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div id="game-container" className="screen-container">
        <div id="phaser-container" className="cursor-pointer screen-container absolute pointer-events-auto z-10"></div>
        {!!game && (
          <GameProvider game={game}>
            <BackgroundParallaxEffect />
            <CommandBackgroundEffect />
            <WidgetProvider>
              <div className="relative z-20 pointer-events-none">
                {isDead && <YouDied />}
                <GameHUD />
              </div>
            </WidgetProvider>
          </GameProvider>
        )}
      </div>
    </div>
  );
});
