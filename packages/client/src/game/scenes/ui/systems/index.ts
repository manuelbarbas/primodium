import { Scene } from "engine/types";
import { mapOpenFx } from "./mapOpenFx";

export const runSystems = (scene: Scene) => {
  mapOpenFx(scene);
};
