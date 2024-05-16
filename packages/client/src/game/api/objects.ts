import { Entity } from "@latticexyz/recs";
import { Fleet } from "../lib/objects/Fleet";
import { Coord, Scene } from "engine/types";
import { TransitLine } from "@/game/lib/objects/TransitLine";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { BaseSpawnArgs, DeferredRenderContainer } from "@/game/lib/objects/DeferredRenderContainer";
import { Building, BuildingConstruction } from "@/game/lib/objects/Building";
import { BoundingBox, PrimodiumGameObject } from "engine/lib/core/StaticObjectManager";

type PrimodiumObjectApi<T extends { destroy: () => void }> = {
  has: (entity: Entity) => boolean;
  get: (entity: Entity) => T | undefined;
  getContainer: <SpawnedObject extends PrimodiumGameObject, SpawnArgs extends BaseSpawnArgs>(
    entity: Entity
  ) => DeferredRenderContainer<SpawnedObject, SpawnArgs> | undefined;
  remove: (entity: Entity, destroy?: boolean, decrement?: boolean) => void;
  add: (entity: Entity, object: PrimodiumGameObject, cull?: boolean) => PrimodiumGameObject;
  addContainer: <SpawnedObject extends PrimodiumGameObject, SpawnArgs extends BaseSpawnArgs>(
    entity: Entity,
    container: DeferredRenderContainer<SpawnedObject, SpawnArgs>
  ) => DeferredRenderContainer<SpawnedObject, SpawnArgs>;
  updatePosition: (entity: Entity, coord: Coord) => void;
  setBoundingBoxes: (entity: Entity, boundingBoxes: BoundingBox[]) => void;
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
        // console.log(object.postFX);
        scene.objects.add(fullId(entity), object, cull);
        return object;
      } else {
        throw new Error("Object is not an instance of the expected class");
      }
    },
    addContainer: <SpawnedObject extends PrimodiumGameObject, SpawnArgs extends BaseSpawnArgs>(
      entity: Entity,
      container: DeferredRenderContainer<SpawnedObject, SpawnArgs>
    ) => {
      if (container instanceof DeferredRenderContainer) {
        scene.objects.addContainer(fullId(entity), container);
        return container;
      } else {
        throw new Error("Object is not an instance of the expected class");
      }
    },
    updatePosition: (entity: Entity, coord) => {
      if (!scene.objects.has(fullId(entity))) throw new Error("Object not found");
      scene.objects.updateObjectPosition(fullId(entity), coord);
    },
    has: (entity: Entity) => scene.objects.has(fullId(entity)),
    get: (entity: Entity) => {
      const object = scene.objects.get(fullId(entity));
      return object instanceof objectClass ? object : undefined;
    },
    getContainer: <SpawnedObject extends PrimodiumGameObject, SpawnArgs extends BaseSpawnArgs>(entity: Entity) => {
      const container = scene.objects.getContainer(fullId(entity));
      return container instanceof DeferredRenderContainer
        ? (container as DeferredRenderContainer<SpawnedObject, SpawnArgs>)
        : undefined;
    },
    remove: (entity: Entity, destroy = false, decrement = false) => {
      const id = fullId(entity);
      scene.objects.remove(id, destroy, decrement);
    },
    setBoundingBoxes: (entity: Entity, boundingBoxes: BoundingBox[]) => {
      if (!scene.objects.has(fullId(entity))) throw new Error("Object not found");
      scene.objects.setBoundingBoxes(fullId(entity), boundingBoxes);
    },
    onNewObject: (callback: (entity: string) => void) => {
      return scene.objects.onNewObject(callback);
    },
  };
}

interface PrimodiumObjectApiMap {
  fleet: PrimodiumObjectApi<Fleet>;
  transitLine: PrimodiumObjectApi<TransitLine>;
  asteroid: PrimodiumObjectApi<BaseAsteroid>;
  building: PrimodiumObjectApi<Building>;
  constructionBuilding: PrimodiumObjectApi<BuildingConstruction>;
  deferredRenderContainer: PrimodiumObjectApi<DeferredRenderContainer>;
}

// Wrapper around scene.objects.get to provide type safety
export function createObjectApi(scene: Scene): PrimodiumObjectApiMap {
  return {
    fleet: factory(scene, Fleet),
    transitLine: factory(scene, TransitLine, "transit"),
    asteroid: factory(scene, BaseAsteroid),
    building: factory(scene, Building),
    constructionBuilding: factory(scene, BuildingConstruction),
    deferredRenderContainer: factory(scene, DeferredRenderContainer, "container"),
  };
}
