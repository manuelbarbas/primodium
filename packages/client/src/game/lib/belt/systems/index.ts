import { Scene } from "engine/types";
import { renderTrajectory } from "./renderTrajectory";

export const runSystems = (scene: Scene) => {
  renderTrajectory(scene);
};
