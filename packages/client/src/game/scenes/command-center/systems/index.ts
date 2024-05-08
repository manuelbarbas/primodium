import { SceneApi } from "@/game/api/scene";
import { renderOverview } from "@/game/scenes/command-center/systems/renderOverview";

export const runSystems = (scene: SceneApi) => {
  renderOverview(scene);
};
