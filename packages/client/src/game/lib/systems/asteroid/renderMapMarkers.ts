import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { createArrowMarker } from "../../factory/arrowMarker";
import { Marker, Position } from "src/network/components/clientComponents";
import { world } from "src/network/world";

export const renderMapMarkers = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_mapMarker";

  const query = [Has(Marker), Has(Position)];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const entity = world.entities[update.entity];
    const objGraphicsIndex = update.entity + objIndexSuffix;

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    if (!Marker.has(entity)) {
      if (scene.objectPool.objects.has(objGraphicsIndex)) {
        scene.objectPool.remove(objGraphicsIndex);
      }
      return;
    }

    const tileCoord = Position.get(entity);

    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const mapMarkerGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    mapMarkerGraphicsEmbodiedEntity.setComponent(
      createArrowMarker({
        id: objGraphicsIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileHeight,
        tileWidth,
        color: 0xffff00,
        alpha: 0,
      })
    );
  };

  defineEnterSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const entityIndex = update.entity;
    // Avoid on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const objGraphicsIndex = update.entity + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);
  });
};
