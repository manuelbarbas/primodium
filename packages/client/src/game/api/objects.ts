import { Entity } from "@latticexyz/recs";
import { Fleet } from "../lib/objects/Fleet";
import { Scene } from "engine/types";
import { TransitLine } from "../lib/objects/TransitLine";
import { BaseAsteroid } from "../lib/objects/Asteroid/BaseAsteroid";
import { Building, BuildingConstruction } from "@/game/lib/objects/Building";

function factory<T extends { destroy: () => void }>(
  scene: Scene,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectClass: abstract new (...args: any[]) => T,
  prefix?: string
): { has: (entity: Entity) => boolean; get: (entity: Entity) => T | undefined; remove: (entity: Entity) => void } {
  const fullId = (entity: Entity) => `${prefix ? `${prefix}_` : ""}${entity}`;

  return {
    has: (entity: Entity) => scene.objects.has(fullId(entity)),
    get: (entity: Entity) => {
      const object = scene.objects.get(fullId(entity));
      return object instanceof objectClass ? object : undefined;
    },
    remove: (entity: Entity) => {
      const object = scene.objects.get(fullId(entity));
      if (object instanceof objectClass) {
        object.destroy();
      }
    },
  };
}

// Wrapper around scene.objects.get to provide type safety
export function createObjectApi(scene: Scene) {
  return {
    fleet: factory(scene, Fleet),
    transitLine: factory(scene, TransitLine, "transit"),
    asteroid: factory(scene, BaseAsteroid),
    building: factory(scene, Building),
    constructionBuilding: factory(scene, BuildingConstruction),
  };
}
