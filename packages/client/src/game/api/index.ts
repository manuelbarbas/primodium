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
import { setupMoveNotifications } from "src/network/systems/setupMoveNotifications";
import { setupInvitations } from "src/network/systems/setupPlayerInvites";
import { setupSwapNotifications } from "src/network/systems/setupSwapNotifications";
import { setupSync } from "src/network/systems/setupSync";
import { setupTime } from "src/network/systems/setupTime";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import _init from "../init";

export type Primodium = Awaited<ReturnType<typeof initPrimodium>>;
export async function initPrimodium(version = "v1") {
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
    api.GAME.dispose();

    //dispose game logic
    world.dispose("game");
    world.dispose("systems");
  }

  function runSystems(mud: MUD) {
    console.info("[Primodium] Running systems");
    world.dispose("systems");

    components.SelectedMode.set({ value: Mode.Asteroid });
    setupBuildRock();
    setupSwapNotifications(mud);
    setupBattleComponents();
    setupMoveNotifications();
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar();
    setupLeaderboard();
    setupInvitations(mud);
    setupTime(mud);
    setupTrainingQueues();
    setupHomeAsteroid(mud);
    setupBuildingReversePosition();
    setupSync(mud);

    api.ASTEROID.runSystems?.(mud);
    api.STARMAP.runSystems?.(mud);
    api.ROOT.runSystems?.(mud);
  }

  return { ...api, destroy, runSystems };
}
