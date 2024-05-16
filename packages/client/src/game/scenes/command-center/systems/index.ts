import { PrimodiumScene } from "@/game/api/scene";
import { renderOverview } from "@/game/scenes/command-center/systems/renderOverview";
import { renderTrajectory } from "@/game/scenes/command-center/systems/renderTrajectory";

export const runSystems = (scene: PrimodiumScene) => {
  renderOverview(scene);
  renderTrajectory(scene);
};
