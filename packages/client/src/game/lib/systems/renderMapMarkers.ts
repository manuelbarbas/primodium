import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { Network } from "src/network/layer";
import { Scene } from "engine/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { createArrowMarker } from "../factory/arrowMarker";

export const renderMapMarkers = (scene: Scene, network: Network) => {
  const { world, components, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_mapMarker";

  const query = [Has(offChainComponents.Marker), Has(components.Position)];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objGraphicsIndex = update.entity + objIndexSuffix;

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    if (!hasComponent(offChainComponents.Marker, entityIndex)) {
      if (scene.objectPool.objects.has(objGraphicsIndex)) {
        scene.objectPool.remove(objGraphicsIndex);
      }
      return;
    }

    const tileCoord = getComponentValue(components.Position, entityIndex);

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
