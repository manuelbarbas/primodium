import { Core } from "@primodiumxyz/core";

import { PrimodiumScene } from "@/types";
import { renderBattle } from "@/scenes/command-center/systems/renderBattle";
import { renderOverview } from "@/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@/scenes/command-center/systems/renderTrajectory";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  renderOverview(scene, core);
  renderTrajectory(scene, core);
  renderBattle(scene, core);
};
