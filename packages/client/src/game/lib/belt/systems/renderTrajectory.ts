import { Scene } from "engine/types";
import { ObjectPosition } from "../../common/object-components/common";

export const renderTrajectory = (scene: Scene) => {
  const render = () => {
    const trajectoryObjectGroup = scene.objectPool.getGroup("temp");

    trajectoryObjectGroup.add("Graphics").setComponents([
      ObjectPosition({
        x: 0,
        y: 0,
      }),
    ]);
  };

  render();
};
