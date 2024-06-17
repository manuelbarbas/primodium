import { Core } from "@primodiumxyz/core";

import { PrimodiumScene } from "@game/types";
import { renderBattle } from "@game/scenes/command-center/systems/renderBattle";
import { renderOverview } from "@game/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@game/scenes/command-center/systems/renderTrajectory";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  renderOverview(scene, core);
  renderTrajectory(scene, core);
  renderBattle(scene, core);
};
