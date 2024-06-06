import { PrimodiumScene } from "@/api/scene";
import { renderBattle } from "@/scenes/command-center/systems/renderBattle";
import { renderOverview } from "@/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@/scenes/command-center/systems/renderTrajectory";

export const runSystems = (scene: PrimodiumScene) => {
  renderOverview(scene);
  renderTrajectory(scene);
  renderBattle(scene);
};
