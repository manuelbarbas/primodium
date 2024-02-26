import { useEffect, useState } from "react";
import { useMud } from "src/hooks/useMud";

import { Primodium, initPrimodium } from "@game/api";
import { Progress } from "src/components/core/Progress";
import { GameHUD } from "src/components/hud/HUD";
import { PrimodiumProvider } from "src/hooks/providers/PrimodiumProvider";
import { WidgetProvider } from "src/hooks/providers/WidgetProvider";
import { setupSessionAccount } from "src/network/systems/setupSessionAccount";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const mud = useMud();
  const [primodium, setPrimodium] = useState<Primodium | null>(null);

  /* Since this system modifies mud.sessionAccount, it can't have mud as a dependency */
  useEffect(() => {
    setupSessionAccount(mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount);
  }, [mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount]);

  useEffect(() => {
    if (!primodium) return;
    primodium.runSystems(mud);
  }, [mud, primodium]);

  useEffect(() => {
    (async () => {
      try {
        const pri = await initPrimodium(mud, params.get("version") ? params.get("version")! : "🔥");
        setPrimodium(pri);
      } catch (e) {
        console.log(e);
      }
    })();

    return () => {
      primodium?.destroy();
    };
  }, []);

  return (
    <div>
      {!primodium && (
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
          {!!primodium && (
            <PrimodiumProvider {...primodium}>
              <WidgetProvider>
                <GameHUD />
              </WidgetProvider>
            </PrimodiumProvider>
          )}
        </div>
      </div>
    </div>
  );
};
