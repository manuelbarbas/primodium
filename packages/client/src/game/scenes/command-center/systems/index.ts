import { PrimodiumScene } from "@/game/api/scene";
import { renderOverview } from "@/game/scenes/command-center/systems/renderOverview";

export const runSystems = (scene: PrimodiumScene) => {
  renderOverview(scene);
};
