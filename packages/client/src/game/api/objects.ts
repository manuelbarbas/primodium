import { Entity } from "@latticexyz/recs";
import { Fleet } from "../lib/objects/Fleet";
import { Scene } from "engine/types";
import { TransitLine } from "../lib/objects/TransitLine";
import { BaseAsteroid } from "../lib/objects/Asteroid/BaseAsteroid";
import { Building, BuildingConstruction } from "@/game/lib/objects/Building";
import { PrimodiumGameObject } from "engine/lib/core/StaticObjectManager";

type PrimodiumObjectApi<T extends { destroy: () => void }> = {
  has: (entity: Entity) => boolean;
  get: (entity: Entity) => T | undefined;
  remove: (entity: Entity) => void;
  add: (entity: Entity, object: PrimodiumGameObject, cull?: boolean) => PrimodiumGameObject;
  onNewObject: (callback: (entity: string) => void) => () => void;
};

function factory<T extends { destroy: () => void }>(
  scene: Scene,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectClass: abstract new (...args: any[]) => T,
  prefix?: string
): PrimodiumObjectApi<T> {
  const fullId = (entity: Entity) => `${prefix ? `${prefix}_` : ""}${entity}`;

  return {
    add: (entity: Entity, object: PrimodiumGameObject, cull = false) => {
      if (object instanceof objectClass) {
        // console.log("adding", { entity, object });
        scene.objects.add(fullId(entity), object, cull);
        return object;
      } else {
        throw new Error("Object is not an instance of the expected class");
      }
    },
    has: (entity: Entity) => scene.objects.has(fullId(entity)),
    get: (entity: Entity) => {
      const object = scene.objects.get(fullId(entity));
      return object instanceof objectClass ? object : undefined;
    },
    remove: (entity: Entity) => {
      const id = fullId(entity);
      scene.objects.remove(id);
    },
    onNewObject: (callback: (entity: string) => void) => {
      return scene.objects.onNewObject(callback);
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
