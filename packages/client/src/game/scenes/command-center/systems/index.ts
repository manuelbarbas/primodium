import { PrimodiumScene } from "@/game/api/scene";
import { renderBattle } from "@/game/scenes/command-center/systems/renderBattle";
import { renderOverview } from "@/game/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@/game/scenes/command-center/systems/renderTrajectory";

export const runSystems = (scene: PrimodiumScene) => {
  renderOverview(scene);
  renderTrajectory(scene);
  renderBattle(scene);
};
