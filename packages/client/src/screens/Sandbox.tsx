import { useEffect, useState } from "react";
import { useMud } from "src/hooks/useMud";

import { GameProvider } from "@/hooks/providers/GameProvider";
import { PrimodiumGame, initGame } from "@game/api";
import { Progress } from "src/components/core/Progress";
import { setupSessionAccount } from "src/network/systems/setupSessionAccount";
import { _Sandbox } from "../components/_Sandbox";

const params = new URLSearchParams(window.location.search);

export const Sandbox = () => {
  const mud = useMud();
  const [game, setGame] = useState<PrimodiumGame | null>(null);

  /* Since this system modifies mud.sessionAccount, it can't have mud as a dependency */
  useEffect(() => {
    setupSessionAccount(mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount);
  }, [mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount]);

  useEffect(() => {
    if (!game) return;
    game.runSystems(mud);
  }, [mud, game]);

  useEffect(() => {
    (async () => {
      try {
        const pri = await initGame(params.get("version") ? params.get("version")! : "🔥");
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
