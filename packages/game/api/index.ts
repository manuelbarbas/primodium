import { setupHomeAsteroid } from "@primodiumxyz/core/network/systems/setupHomeAsteroid";
import { Mode } from "@primodiumxyz/core/util/constants";
import { namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { setupBattleComponents } from "@primodiumxyz/core/network/systems/setupBattleComponents";
import { setupBlockNumber } from "@primodiumxyz/core/network/systems/setupBlockNumber";
import { setupBuildRock } from "@primodiumxyz/core/network/systems/setupBuildRock";
import { setupBuildingReversePosition } from "@primodiumxyz/core/network/systems/setupBuildingReversePosition";
import { setupDoubleCounter } from "@primodiumxyz/core/network/systems/setupDoubleCounter";
import { setupHangar } from "@primodiumxyz/core/network/systems/setupHangar";
import { setupLeaderboard } from "@primodiumxyz/core/network/systems/setupLeaderboard";
import { setupSync } from "@primodiumxyz/core/network/systems/setupSync";
import { setupTime } from "@primodiumxyz/core/network/systems/setupTime";
import { setupTrainingQueues } from "@primodiumxyz/core/network/systems/setupTrainingQueues";
import { MUD } from "@primodiumxyz/core/network/types";
import { world } from "@primodiumxyz/core/network/world";
import { setupWormholeResource } from "@primodiumxyz/core/network/systems/setupWormholeResource";
import { setupBattleNotifications } from "@primodiumxyz/core/network/systems/setupBattleNotifications";
import _init from "@/init";
import { Scenes } from "@/lib/constants/common";
import { runSystems as runCommonSystems } from "@/scenes/common/systems";

export type PrimodiumGame = Awaited<ReturnType<typeof initGame>>;
export async function initGame(version = "v1") {
  const asciiArt = `

  ██████╗ ██████╗ ██╗███╗   ███╗ ██████╗ ██████╗ ██╗██╗   ██╗███╗   ███╗
  ██╔══██╗██╔══██╗██║████╗ ████║██╔═══██╗██╔══██╗██║██║   ██║████╗ ████║
  ██████╔╝██████╔╝██║██╔████╔██║██║   ██║██║  ██║██║██║   ██║██╔████╔██║
  ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██║   ██║██║  ██║██║██║   ██║██║╚██╔╝██║
  ██║     ██║  ██║██║██║ ╚═╝ ██║╚██████╔╝██████╔╝██║╚██████╔╝██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝

                                                                          `;

  console.log("%c" + asciiArt, "color: white; background-color: brown;");

  console.log(`%cPrimodium ${version}`, "color: white; background-color: black;", "https://twitter.com/primodiumgame");

  namespaceWorld(world, "game");

  const api = await _init();

  function destroy() {
    api.GLOBAL.dispose();

    //dispose game logic
    world.dispose("game");
    world.dispose("systems");
  }

  function runSystems(mud: MUD) {
    const primary = () => {
      console.info("[Game] Running primary systems");
      world.dispose("systems");

      components.SelectedMode.set({ value: Mode.Asteroid });
      setupBuildRock();
      setupBattleComponents();
      setupBlockNumber(mud.network.latestBlockNumber$);
      setupDoubleCounter(mud);
      setupHangar();
      setupLeaderboard();
      setupWormholeResource();
      setupBattleNotifications();
      setupTime(mud);
      setupTrainingQueues();
      setupHomeAsteroid(mud);
      setupBuildingReversePosition();
      setupSync(mud);

      Object.values(Scenes).forEach((key) => {
        const scene = api[key];
        if (scene.isPrimary) scene.runSystems?.(mud);
      });
    };

    const secondary = () => {
      console.info("[Game] Running secondary systems");
      Object.values(Scenes).forEach((key) => {
        const scene = api[key];
        if (!scene.isPrimary) scene.runSystems?.(mud);
      });
    };

    // run after all systems are ready
    // includes common systems that run across all scenes
    // we can use that to keep the loading screen until all systems are run to prevent annoying stutter while the interface is ready
    const done = () => {
      console.info("[Game] Running common systems");
      runCommonSystems(api);
      components.SystemsReady.set({ value: true });
    };

    return { primary, secondary, done };
  }

  return { ...api, destroy, runSystems };
}
