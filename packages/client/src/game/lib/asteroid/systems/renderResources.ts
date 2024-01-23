import { FogTilekeys, ResourceToTilesetKey, Tilesets } from "@game/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getAsteroidMaxBounds } from "src/util/outOfBounds";
import { getResourceKey } from "src/util/tile";

export function renderResources(scene: Scene) {
  const objSuffix = "_resources";
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value: [newVal, oldVal] }) => {
    if (!newVal?.value) return;
    //remove old indicators
    scene.objectPool.removeGroup(oldVal?.value + objSuffix);

    //dispose old system
    world.dispose("resources_world");

    if (oldVal) {
      const oldAsteroidBounds = getAsteroidMaxBounds(oldVal.value);

      // remove old resources
      for (let x = oldAsteroidBounds.minX; x <= oldAsteroidBounds.maxX; x++) {
        for (let y = oldAsteroidBounds.minY; y <= oldAsteroidBounds.maxY; y++) {
          scene.tilemap.map?.putTileAt({ x, y: -y }, FogTilekeys.Empty, Tilesets.Resource);
        }
      }

      // add new resources
      const mapId = components.Asteroid.get(newVal.value)?.mapId ?? 0;
      const bounds = getAsteroidMaxBounds(newVal.value);

      for (let x = bounds.minX + 1; x <= bounds.maxX - 1; x++) {
        for (let y = bounds.minY + 1; y <= bounds.maxY - 1; y++) {
          const resource = getResourceKey({ x, y }, mapId);

          if (!resource) continue;
          const resourceId = ResourceToTilesetKey[resource] ?? 0;
          scene.tilemap.map?.putTileAt({ x, y: -y }, resourceId, Tilesets.Resource);
        }
      }
    }
  });
}
