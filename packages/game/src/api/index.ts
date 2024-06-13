import { Core } from "@primodiumxyz/core";
import { namespaceWorld } from "@primodiumxyz/reactive-tables";

import init from "@/init";
import { Scenes } from "@/lib/constants/common";
import { runSystems as runCommonSystems } from "@/scenes/common/systems";

export type PrimodiumGame = Awaited<ReturnType<typeof initGame>>;
export async function initGame(core: Core, version = "v1") {
  const {
    network: { world },
    tables,
  } = core;

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

  const api = await init(core);

  function destroy() {
    api.GLOBAL.dispose();

    //dispose game logic
    world.dispose("game");
    world.dispose("systems");
  }

  function runSystems() {
    const primary = () => {
      console.info("[Game] Running primary systems");

      Object.values(Scenes).forEach((key) => {
        const scene = api[key];
        if (scene.isPrimary) scene.runSystems?.();
      });
    };

    const secondary = () => {
      console.info("[Game] Running secondary systems");
      Object.values(Scenes).forEach((key) => {
        const scene = api[key];
        if (!scene.isPrimary) scene.runSystems?.();
      });
    };

    // run after all systems are ready
    // includes common systems that run across all scenes
    // we can use that to keep the loading screen until all systems are run to prevent annoying stutter while the interface is ready
    const done = () => {
      console.info("[Game] Running common systems");
      runCommonSystems(api, core);
      tables.SystemsReady.set({ value: true });
    };

    return { primary, secondary, done };
  }

  return { ...api, destroy, runSystems };
}
