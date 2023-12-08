import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { ObjectPosition, Tween } from "../../common/object-components/common";
import { Circle } from "../../common/object-components/graphics";

export const renderArrivalsInOrbit = (scene: Scene, mud: SetupResult) => {
  const playerEntity = mud.network.playerEntity;
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrivalOrbit";

  const query = [Has(components.Arrival)];

  const render = ({ entity }: ComponentUpdate) => {
    scene.objectPool.removeGroup(entity + objIndexSuffix);
    const arrival = components.Arrival.getEntity(entity);

    if (!arrival) return;

    //don't render if arrival is in transit
    const now = components.Time.get()?.value ?? 0n;
    if (arrival.arrivalTime >= now) return;

    //render personal pirate only
    if (
      components.PirateAsteroid.has(arrival.destination) &&
      hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(arrival.destination)?.value
    )
      return;

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
