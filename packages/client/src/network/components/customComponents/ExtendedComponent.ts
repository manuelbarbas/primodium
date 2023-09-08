import {
  Component,
  ComponentUpdate,
  ComponentValue,
  Entity,
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
  removeComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { overridableComponent } from "./overridableComponent";
type OverridableType<
  Overridable extends boolean,
  S extends Schema,
  M extends Metadata = Metadata,
  T = unknown
> = Overridable extends true ? OverridableComponent<S, M, T> : Component<S, M, T>;

export interface Options<Overridable extends boolean, M extends Metadata> {
  id: string;
  metadata?: M;
  indexed?: boolean;
  overridable?: Overridable;
}

export type ExtendedComponent<S extends Schema, M extends Metadata, T = unknown> = Component<S, M, T> & {
  get(): ComponentValue<S> | undefined;
  get(entity: Entity | undefined): ComponentValue<S> | undefined;
  get(entity?: Entity | undefined, defaultValue?: ComponentValue<S>): ComponentValue<S> | undefined;

  set: (value: ComponentValue<S, T>, entity?: Entity) => void;
  getAll: () => Entity[];
  getAllWith: (value: Partial<ComponentValue<S>>) => Entity[];
  getAllWithout: (value: Partial<ComponentValue<S>>) => Entity[];
  remove: (entity?: Entity) => void;
  clear: () => void;
  update: (value: Partial<ComponentValue<S, T>>, entity?: Entity) => void;
  has: (entity?: Entity) => boolean;

  use(entity?: Entity | undefined): ComponentValue<S> | undefined;
  use(entity: Entity | undefined, defaultValue?: ComponentValue<S>): ComponentValue<S>;
};

export function extendComponent<S extends Schema, M extends Metadata, T = unknown>(
  component: Component<S, M, T>
): ExtendedComponent<S, M, T> {
  function set(value: ComponentValue<S, T>, entity?: Entity) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) throw new Error(`[set ${entity} for ${component.id}] no entity registered`);
    setComponent(component, entity, value);
  }

  function get(entity?: Entity, defaultValue?: ComponentValue<S>) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) return defaultValue;
    const value = getComponentValue(component, entity);
    return value ?? defaultValue;
  }

  function getAll() {
    const entities = runQuery([Has(component)]);
    return [...entities];
  }

  function getAllWith(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([HasValue(component, value)]);
    return [...entities];
  }

  function getAllWithout(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([NotValue(component, value)]);
    return [...entities];
  }

  function remove(entity?: Entity) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) return;
    removeComponent(component, entity);
  }

  function clear() {
    const entities = runQuery([Has(component)]);
    entities.forEach((entity) => removeComponent(component, entity));
  }

  function update(value: Partial<ComponentValue<S, T>>, entity?: Entity) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) throw new Error(`[update ${component.id}] no entity registered`);
    updateComponent(component, entity, value);
  }

  function has(entity?: Entity) {
    if (entity == undefined) return false;
    return hasComponent(component, entity);
  }
  function isComponentUpdate<S extends Schema>(
    update: ComponentUpdate,
    component: Component<S>
  ): update is ComponentUpdate<S> {
    return update.component.id === component.id;
  }

  function use(entity?: Entity | undefined): ComponentValue<S> | undefined;
  function use(entity: Entity | undefined, defaultValue?: ComponentValue<S>): ComponentValue<S>;
  function use(entity?: Entity, defaultValue?: ComponentValue<S>) {
    entity = entity ?? singletonEntity;
    const comp = component as Component<S>;
    const [value, setValue] = useState(entity != null ? getComponentValue(comp, entity) : undefined);
    useEffect(() => {
      // component or entity changed, update state to latest value
      setValue(entity != null ? getComponentValue(component, entity) : undefined);
      if (entity == null) return;
      // fix: if pre-populated with state, useComponentValue doesn’t update when there’s a component that has been removed.
      const queryResult = defineQuery([Has(component)], { runOnInit: false });
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

export function createExtendedComponent<
  Overridable extends boolean,
  S extends Schema,
  M extends Metadata = Metadata,
  T = unknown
>(world: World, schema: S, options?: Options<Overridable, M>) {
  const rawComponent = defineComponent(world, schema, options);
  const component: OverridableType<Overridable, S, M> = options?.overridable
    ? overridableComponent(rawComponent)
    : (rawComponent as OverridableType<Overridable, S, M>);

  return extendComponent(component);
}

export function createExtendedNumberComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  return createExtendedComponent(world, { value: Type.Number }, options);
}

export function createExtendedStringComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  return createExtendedComponent(world, { value: Type.String }, options);
}

export function createExtendedCoordComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  return createExtendedComponent(world, { x: Type.Number, y: Type.Number }, options);
}

export function createExtendedBoolComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  return createExtendedComponent(world, { value: Type.Boolean }, options);
}

export function createExtendedEntityComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  return createExtendedComponent(world, { value: Type.Entity }, options);
}
