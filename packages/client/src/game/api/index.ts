import { setupHomeAsteroid } from "@/network/systems/setupHomeAsteroid";
import { Mode } from "@/util/constants";
import { namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { setupBattleComponents } from "src/network/systems/setupBattleComponents";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupBuildRock } from "src/network/systems/setupBuildRock";
import { setupBuildingReversePosition } from "src/network/systems/setupBuildingReversePosition";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupSync } from "src/network/systems/setupSync";
import { setupTime } from "src/network/systems/setupTime";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import _init from "../init";
import { PrimaryScenes, SecondaryScenes } from "@/game/lib/constants/common";

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
    api.primary.GLOBAL.dispose();

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
      setupTime(mud);
      setupTrainingQueues();
      setupHomeAsteroid(mud);
      setupBuildingReversePosition();
      setupSync(mud);

      Object.values(PrimaryScenes).forEach((scene) => {
        api.primary[scene].runSystems?.(mud);
      });
    };

    const secondary = () => {
      console.info("[Game] Running secondary systems");
      Object.values(SecondaryScenes).forEach((scene) => {
        api.secondary[scene].runSystems?.(mud);
      });
    };

    // run after all systems are ready
    // we can use that to keep the loading screen until all systems are run to prevent annoying stutter while the interface is ready
    const done = () => {
      components.SystemsReady.set({ value: true });
    };

    return { primary, secondary, done };
  }

  return { ...api.primary, ...api.secondary, destroy, runSystems };
}
