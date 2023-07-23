import {
  Component,
  ComponentValue,
  EntityID,
  Has,
  HasValue,
  Metadata,
  NotValue,
  OverridableComponent,
  Schema,
  Type,
  World,
  defineComponent,
  getComponentValue,
  hasComponent,
  overridableComponent,
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { singletonIndex } from "../../world";

type OverridableType<
  Overridable extends boolean,
  S extends Schema,
  M extends Metadata = Metadata,
  T = undefined
> = Overridable extends true
  ? OverridableComponent<S, M, T>
  : Component<S, M, T>;

export interface Options<Overridable extends boolean, M extends Metadata> {
  id?: string;
  metadata?: M;
  indexed?: boolean;
  overridable?: Overridable;
}

function newComponent<
  Overridable extends boolean,
  S extends Schema,
  M extends Metadata = Metadata,
  T = undefined
>(world: World, schema: S, options?: Options<Overridable, M>) {
  const rawComponent = defineComponent(world, schema, options);
  const component: OverridableType<Overridable, S, M> = options?.overridable
    ? overridableComponent(rawComponent)
    : (rawComponent as OverridableType<Overridable, S, M>);

  function getEntity(entityID: EntityID) {
    const entity = world.entityToIndex.get(entityID);
    if (entity == undefined) return;
    return entity;
  }

  // Actual method implementation:
  function set(value: ComponentValue<S, T>, entityID?: EntityID) {
    // is the (entityID, value) overload
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (entity == undefined)
      throw new Error(
        `[set ${entityID} for ${component.id}] no entity registered`
      );
    console.log(`setting ${entity} for ${component.id} to `, value);
    setComponent(component, entity, value);
  }

  function get(): ComponentValue<S> | undefined;
  function get(entityID: EntityID): ComponentValue<S> | undefined;
  function get(
    entityID: EntityID,
    defaultValue?: ComponentValue<S>
  ): ComponentValue<S>;

  function get(entityID?: EntityID, defaultValue?: ComponentValue<S>) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (!entity) return defaultValue;
    const value = getComponentValue(component, entity)?.value;
    return value ?? defaultValue;
  }

  function getAll() {
    const entities = runQuery([Has(component)]);
    return [...entities].map((entity) => world.entities[entity]);
  }

  function getAllWith(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([HasValue(component, value)]);
    return [...entities].map((entity) => world.entities[entity]);
  }

  function getAllWithout(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([NotValue(component, value)]);
    return [...entities].map((entity) => world.entities[entity]);
  }

  function remove(entityID?: EntityID) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (!entity) return;
    return removeComponent(component, entity);
  }

  function clear() {
    const entities = runQuery([Has(component)]);
    entities.forEach((entity) => removeComponent(component, entity));
  }

  function update(value: Partial<ComponentValue<S, T>>, entityID?: EntityID) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (entity == undefined)
      throw new Error(`[update ${component.id}] no entity registered`);
    updateComponent(component, entity, value);
  }

  function has(entityID?: EntityID) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (!entity) return false;
    return hasComponent(component, entity);
  }
  return {
    ...component,
    get,
    set,
    getAll,
    getAllWith,
    getAllWithout,
    remove,
    clear,
    update,
    has,
  };
}

export default newComponent;

export function newNumberComponent<
  Overridable extends boolean,
  M extends Metadata
>(world: World, options?: Options<Overridable, M>) {
  return newComponent(world, { value: Type.Number }, options);
}

export function newStringComponent<
  Overridable extends boolean,
  M extends Metadata
>(world: World, options?: Options<Overridable, M>) {
  return newComponent(world, { value: Type.String }, options);
}

export function newCoordComponent<
  Overridable extends boolean,
  M extends Metadata
>(world: World, options?: Options<Overridable, M>) {
  return newComponent(world, { x: Type.Number, y: Type.Number }, options);
}

export function newBoolComponent<
  Overridable extends boolean,
  M extends Metadata
>(world: World, options?: Options<Overridable, M>) {
  return newComponent(world, { value: Type.Boolean }, options);
}
