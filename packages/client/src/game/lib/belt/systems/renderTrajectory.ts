import { Scene } from "engine/types";
import { ObjectPosition } from "../../common/object-components/common";
import { Path } from "../../common/object-components/graphics";

export const renderTrajectory = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  //   const gameWorld = namespaceWorld(world, "game");

  //   const query = [Has(HoverTile)];

  const render = () => {
    const trajectoryObjectGroup = scene.objectPool.getGroup("temp");

    trajectoryObjectGroup.add("Graphics").setComponents([
      ObjectPosition({
        x: 0,
        y: 0,
      }),
      Path(
        { x: 10 * tileWidth, y: -10 * tileHeight },
        {
          color: 0xff0000,
        }
      ),
    ]);
  };

  render();
};
