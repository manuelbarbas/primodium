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
import { DepthLayers } from "@game/constants";
import { hashStringEntity } from "src/util/encode";
import { PIRATE_KEY } from "src/util/constants";
import { SetupResult } from "src/network/types";
import { components } from "src/network/components";
import { getNow } from "src/util/time";

export const renderArrivalsInOrbit = (scene: Scene, mud: SetupResult) => {
  const playerEntity = mud.network.playerEntity;
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrivalOrbit";

  const query = [Has(components.Arrival)];

  const render = ({ entity }: ComponentUpdate) => {
    scene.objectPool.removeGroup(entity + objIndexSuffix);
    const blockInfo = components.BlockNumber.get();
    const arrival = components.Arrival.get(entity);

    if (!arrival || !blockInfo) return;

    //don't render if arrival is in transit
    if (arrival.arrivalTime >= getNow()) return;

    //render personal pirate only
    // if (
    //   components.Pirate.has(arrival.destination) &&
    //   hashStringEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(arrival.destination)?.value
    // )
    //   return;

    const destination = components.Position.get(arrival.destination);

    if (!destination) return;

    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const arrivalOrbit = scene.objectPool.getGroup(entity + objIndexSuffix);

    arrivalOrbit.add("Graphics").setComponents([
      ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
      Circle(50, {
        color: 0x363636,
        borderThickness: 1,
        alpha: 0,
      }),
      Circle(5, {
        color: 0x00ffff,
        borderThickness: 1,
        alpha: 0.75,
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

  defineExitSystem(gameWorld, query, ({ entity }) => {
    const objIndex = entity + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
