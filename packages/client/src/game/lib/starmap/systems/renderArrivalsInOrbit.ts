import {
  ComponentUpdate,
  EntityID,
  Has,
  defineUpdateSystem,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BlockNumber } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition } from "../../common/object-components/common";
import { Circle } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Arrival, Position } from "src/network/components/chainComponents";
import { ESendType } from "src/util/web3/types";
import { DepthLayers } from "@game/constants";

export const renderArrivalsInOrbit = (scene: Scene, player: EntityID) => {
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

    let color: number;

    if (arrival.from === player) color = 0x00ff00;
    else if (arrival.to === player && arrival.sendType === ESendType.REINFORCE)
      color = 0x00ff00;
    else if (arrival.to === player) color = 0xff0000;
    else color = 0x808080;

    arrivalOrbit.add("Graphics").setComponents([
      ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
      Circle(5, {
        color,
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
