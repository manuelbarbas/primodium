import { useEffect, useState } from "react";
import { useMud } from "src/hooks/useMud";

import { usePlayerAsteroids } from "@/hooks/usePlayerAsteroids";
import { YouDied } from "@/screens/YouDied";
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

  const destroy = async () => {
    if (primodium === null) return;
    setPrimodium(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    primodium?.destroy();
    const phaserContainer = document.getElementById("phaser-container");
    for (const child of Array.from(phaserContainer?.children ?? [])) {
      phaserContainer?.removeChild(child);
    }
  };

  const init = async () => {
    try {
      await destroy();
      const pri = await initPrimodium(mud, params.get("version") ? params.get("version")! : "🔥");
      setPrimodium(pri);
    } catch (e) {
      console.log(e);
    }
  };

  /* Since this system modifies mud.sessionAccount, it can't have mud as a dependency */
  useEffect(() => {
    setupSessionAccount(mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount);
  }, [mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount]);

  useEffect(() => {
    if (!primodium) return;
    primodium.runSystems(mud);
  }, [mud, primodium]);

  useEffect(() => {
    init();

    return () => {
      destroy();
    };
  }, []);

  const isDead = usePlayerAsteroids(mud.playerAccount.entity).length === 0;
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
              <WidgetProvider>{isDead ? <YouDied /> : <GameHUD />}</WidgetProvider>
            </PrimodiumProvider>
          )}
        </div>
      </div>
    </div>
  );
};
