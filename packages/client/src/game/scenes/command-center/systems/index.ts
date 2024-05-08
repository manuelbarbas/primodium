import { Scene } from "engine/types";
import { renderOverview } from "@/game/scenes/command-center/systems/renderOverview";

export const runSystems = (scene: Scene) => {
  renderOverview(scene);
};
