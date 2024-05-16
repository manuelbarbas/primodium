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
import { Scenes } from "@/game/lib/constants/common";
import { setupWormholeResource } from "@/network/systems/setupWormholeResource";

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
    console.info("[Game] Running systems");
    world.dispose("systems");

    components.SelectedMode.set({ value: Mode.Asteroid });
    setupBuildRock();
    setupBattleComponents();
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar();
    setupLeaderboard();
    setupWormholeResource();
    setupTime(mud);
    setupTrainingQueues();
    setupHomeAsteroid(mud);
    setupBuildingReversePosition();
    setupSync(mud);

    Object.values(Scenes).forEach((scene) => {
      api[scene].runSystems?.(mud);
    });
  }

  return { ...api, destroy, runSystems };
}
