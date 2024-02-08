import { useEffect, useState } from "react";
import { useMud } from "src/hooks/useMud";

import { Primodium, initPrimodium } from "@game/api";
import { GameHUD } from "src/components/hud/HUD";
import { Initializing } from "src/components/shared/Initializing";
import { PrimodiumProvider } from "src/hooks/providers/PrimodiumProvider";
import { setupDelegate } from "src/network/systems/setupDelegate";

const params = new URLSearchParams(window.location.search);

export const Game = () => {
  const mud = useMud();
  const [primodium, setPrimodium] = useState<Primodium | null>(null);

  /* Since this system modifies mud.sessionAccount, it can't have mud as a dependency */
  useEffect(() => {
    setupDelegate(mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount);
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
      {!primodium && <Initializing message="Loading game" />}

      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div id="game-container relative ">
        <div id="phaser-container" className="absolute cursor-pointer screen-container" />
        {!!primodium && (
          <PrimodiumProvider {...primodium}>
            <GameHUD />
          </PrimodiumProvider>
        )}
      </div>
    </div>
  );
};
