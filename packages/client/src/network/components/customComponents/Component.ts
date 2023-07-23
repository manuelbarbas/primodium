import {
  Component,
  ComponentUpdate,
  ComponentValue,
  EntityID,
  EntityIndex,
  Has,
  HasValue,
  Metadata,
  NotValue,
  OverridableComponent,
  Schema,
  Type,
  World,
  defineComponent,
  defineQuery,
  getComponentValue,
  hasComponent,
  overridableComponent,
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { singletonIndex } from "../../world";
import { useEffect, useMemo, useState } from "react";

type OverridableType<
  Overridable extends boolean,
  S extends Schema,
  M extends Metadata = Metadata,
  T = undefined
> = Overridable extends true
  ? OverridableComponent<S, M, T>
  : Component<S, M, T>;

export interface Options<Overridable extends boolean, M extends Metadata> {
  id: string;
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

  function set(value: ComponentValue<S, T>, entityID?: EntityID) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (entity == undefined)
      throw new Error(
        `[set ${entityID} for ${component.id}] no entity registered`
      );
    setComponent(component, entity, value);
  }

  function get(): ComponentValue<S> | undefined;
  function get(entityID: EntityID | undefined): ComponentValue<S> | undefined;
  function get(
    entityID: EntityID | undefined,
    defaultValue?: ComponentValue<S>
  ): ComponentValue<S>;

  function get(entityID?: EntityID, defaultValue?: ComponentValue<S>) {
    const entity = entityID ? getEntity(entityID) : singletonIndex;
    if (entity == undefined) return defaultValue;
    const value = getComponentValue(component, entity);
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
    if (entity == undefined) return;
    removeComponent(component, entity);
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
    if (entity == undefined) return false;
    return hasComponent(component, entity);
  }
  function isComponentUpdate<S extends Schema>(
    update: ComponentUpdate,
    component: Component<S>
  ): update is ComponentUpdate<S> {
    return update.component.id === component.id;
  }

  function use(entityID?: EntityID | undefined): ComponentValue<S> | undefined;
  function use(
    entityID: EntityID | undefined,
    defaultValue?: ComponentValue<S>
  ): ComponentValue<S>;

  function use(entityID?: EntityID, defaultValue?: ComponentValue<S>) {
    const rawEntity = entityID ? getEntity(entityID) : singletonIndex;

    const entity = rawEntity !== undefined ? rawEntity : (-1 as EntityIndex);
    const [value, setValue] = useState(
      entity != null ? getComponentValue(component, entity) : undefined
    );
    useEffect(() => {
      // component or entity changed, update state to latest value
      setValue(
        entity != null ? getComponentValue(component, entity) : undefined
      );
      if (entity == null) return;
      // fix: if pre-populated with state, useComponentValue doesn’t update when there’s a component that has been removed.
      const queryResult = defineQuery([Has(component)], { runOnInit: true });
      const subscription = queryResult.update$.subscribe((update) => {
        if (isComponentUpdate(update, component) && update.entity === entity) {
          const [nextValue] = update.value;
          setValue(nextValue);
        }
      });
      return () => subscription.unsubscribe();
    }, [component, entity]);
    return value ?? defaultValue;
  }

  const context = {
    ...component,
    override: component,
    get,
    set,
    getAll,
    getAllWith,
    getAllWithout,
    remove,
    clear,
    update,
    has,
    use,
  };
  return context;
}

export default newComponent;

export type NewNumberComponent = ReturnType<typeof newNumberComponent>;
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
