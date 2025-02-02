import { Core } from "@primodiumxyz/core";
import { renderBattle } from "@game/scenes/command-center/systems/renderBattle";
import { renderOverview } from "@game/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@game/scenes/command-center/systems/renderTrajectory";
import { PrimodiumScene } from "@game/types";

export const runSystems = (scene: PrimodiumScene, core: Core) => {
  renderOverview(scene, core);
  renderTrajectory(scene, core);
  renderBattle(scene, core);
};
