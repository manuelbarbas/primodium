import {
  ComponentUpdate,
  Has,
  defineUpdateSystem,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BlockNumber } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition, Tween } from "../../common/object-components/common";
import { Circle } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Arrival, Position } from "src/network/components/chainComponents";
import { DepthLayers } from "@game/constants";

export const renderArrivalsInOrbit = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrivalOrbit";

  const query = [Has(Arrival)];

  const render = (update: ComponentUpdate) => {
    const entityId = world.entities[update.entity];
    scene.objectPool.removeGroup(update.entity + objIndexSuffix);
    const arrival = Arrival.getEntity(entityId);
    const blockInfo = BlockNumber.get();

    if (!arrival || !blockInfo) return;

    //don't render if arrival is in orbit
    if (parseInt(arrival.arrivalBlock) >= blockInfo.value) return;

    const destination = Position.get(arrival.destination);

    if (!destination) return;

    const destinationPixelCoord = tileCoordToPixelCoord(
      { x: destination.x, y: -destination.y },
      tileWidth,
      tileHeight
    );

    const arrivalOrbit = scene.objectPool.getGroup(entityId + objIndexSuffix);

    arrivalOrbit.add("Graphics").setComponents([
      ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
      Circle(50, {
        color: 0x363636,
        borderThickness: 1,
        alpha: 0,
      }),

      Circle(5, {
        color: 0x00ffff,
        borderThickness: 0,
        alpha: 1,
        position: {
          x: destinationPixelCoord.x + 50,
          y: destinationPixelCoord.y,
        },
      }),
      Tween(scene, {
        angle: 360,
        duration: 20 * 1000,
        repeat: -1,
        ease: "Linear",
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const entityId = world.entities[update.entity];
    const objIndex = entityId + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
