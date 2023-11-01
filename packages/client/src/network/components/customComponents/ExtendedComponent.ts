import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser";
import { useEntityQuery } from "@latticexyz/react";
import {
  Component,
  ComponentUpdate,
  ComponentValue,
  Entity,
  Has,
  HasValue,
  Metadata,
  NotValue,
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
import { encodeEntity } from "./util";

export interface Options<M extends Metadata> {
  id: string;
  metadata?: M;
  indexed?: boolean;
}
type NewType<S extends Schema> = Omit<ComponentValue<S>, "__staticData" | "__encodedLengths" | "__dynamicData">;

export type ExtendedComponent<S extends Schema, M extends Metadata, T = unknown> = Component<S, M, T> & {
  get(): ComponentValue<S> | undefined;
  get(entity: Entity | undefined): ComponentValue<S> | undefined;
  get(entity?: Entity | undefined, defaultValue?: NewType<S>): ComponentValue<S>;

  set: (value: ComponentValue<S, T>, entity?: Entity) => void;
  getAll: () => Entity[];
  getAllWith: (value: Partial<ComponentValue<S>>) => Entity[];
  getAllWithout: (value: Partial<ComponentValue<S>>) => Entity[];
  useAll: () => Entity[];
  useAllWith: (value: Partial<ComponentValue<S>>) => Entity[];
  useAllWithout: (value: Partial<ComponentValue<S>>) => Entity[];
  remove: (entity?: Entity) => void;
  clear: () => void;
  update: (value: Partial<ComponentValue<S, T>>, entity?: Entity) => void;
  has: (entity?: Entity) => boolean;

  use(entity?: Entity | undefined): ComponentValue<S> | undefined;
  use(entity: Entity | undefined, defaultValue?: NewType<S>): ComponentValue<S>;
};

export type ContractMetadata<TKeySchema extends KeySchema> = {
  componentName: string;
  tableName: `${string}:${string}`;
  keySchema: TKeySchema;
  valueSchema: Record<string, string>;
};

export type ExtendedContractComponent<
  S extends Schema = Schema,
  TKeySchema extends KeySchema = KeySchema
> = ExtendedComponent<S, ContractMetadata<TKeySchema>, unknown> & {
  getWithKeys(): ComponentValue<S> | undefined;
  getWithKeys(keys?: SchemaToPrimitives<TKeySchema>): ComponentValue<S> | undefined;
  getWithKeys(keys?: SchemaToPrimitives<TKeySchema>, defaultValue?: NewType<S>): ComponentValue<S>;

  hasWithKeys: (keys?: SchemaToPrimitives<TKeySchema>) => boolean;

  useWithKeys(keys?: SchemaToPrimitives<TKeySchema>): ComponentValue<S> | undefined;
  useWithKeys(keys?: SchemaToPrimitives<TKeySchema>, defaultValue?: NewType<S>): ComponentValue<S>;
};

export function extendContractComponent<S extends Schema, TKeySchema extends KeySchema, T = unknown>(
  component: Component<S, ContractMetadata<TKeySchema>, T>
): ExtendedContractComponent<S, TKeySchema> {
  const extendedComponent = extendComponent(component);

  function getWithKeys(): ComponentValue<S> | undefined;
  function getWithKeys(keys?: SchemaToPrimitives<TKeySchema>): ComponentValue<S> | undefined;
  function getWithKeys(keys?: SchemaToPrimitives<TKeySchema>, defaultValue?: NewType<S>): ComponentValue<S>;
  function getWithKeys(keys?: SchemaToPrimitives<TKeySchema>, defaultValue?: NewType<S>) {
    const entity = keys ? encodeEntity(component, keys) : singletonEntity;
    return extendedComponent.get(entity, defaultValue);
  }

  function hasWithKeys(keys?: SchemaToPrimitives<TKeySchema>) {
    const entity = keys ? encodeEntity(component, keys) : singletonEntity;
    return extendedComponent.has(entity);
  }

  function useWithKeys(key?: SchemaToPrimitives<TKeySchema>, defaultValue?: NewType<S>) {
    const entity = key ? encodeEntity(component, key) : singletonEntity;
    return extendedComponent.use(entity, defaultValue);
  }
  return {
    ...extendedComponent,
    getWithKeys,
    hasWithKeys,
    useWithKeys,
  } as ExtendedContractComponent<S, TKeySchema>;
}
export function extendComponent<S extends Schema, M extends Metadata, T = unknown>(
  component: Component<S, M, T>
): ExtendedComponent<S, M, T> {
  function set(value: ComponentValue<S, T>, entity?: Entity) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) throw new Error(`[set ${entity} for ${component.id}] no entity registered`);
    setComponent(component, entity, value);
  }

  function get(): ComponentValue<S> | undefined;
  function get(entity: Entity | undefined): ComponentValue<S> | undefined;
  function get(entity?: Entity | undefined, defaultValue?: NewType<S>): ComponentValue<S>;
  function get(entity?: Entity, defaultValue?: NewType<S>) {
    entity = entity ?? singletonEntity;
    if (entity == undefined) return defaultValue;
    const value = getComponentValue(component, entity);
    return value ?? defaultValue;
  }

  function getAll() {
    const entities = runQuery([Has(component)]);
    return [...entities];
  }

  function useAll() {
    const entitites = useEntityQuery([Has(component)]);
    return [...entitites];
  }

  function getAllWith(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([HasValue(component, value)]);
    return [...entities];
  }

  function useAllWith(value: Partial<ComponentValue<S>>) {
    const entities = useEntityQuery([HasValue(component, value)]);
    return [...entities];
  }

  function getAllWithout(value: Partial<ComponentValue<S>>) {
    const entities = runQuery([NotValue(component, value)]);
    return [...entities];
  }

  function useAllWithout(value: Partial<ComponentValue<S>>) {
    const entities = useEntityQuery([NotValue(component, value)]);
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

  function useValue(entity?: Entity | undefined): ComponentValue<S> | undefined;
  function useValue(entity: Entity | undefined, defaultValue?: NewType<S>): ComponentValue<S>;
  function useValue(entity?: Entity, defaultValue?: NewType<S>) {
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
    useAll,
    useAllWith,
    useAllWithout,
    remove,
    clear,
    update,
    has,
    use: useValue,
  };
  return context;
}

export function createExtendedComponent<S extends Schema, M extends Metadata = Metadata, T = unknown>(
  world: World,
  schema: S,
  options?: Options<M>
) {
  const component = defineComponent<S, M, T>(world, schema, options);

  return extendComponent(component);
}

export type ExtendedNumberComponent = ReturnType<typeof createExtendedNumberComponent>;
export function createExtendedNumberComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { value: Type.Number }, options);
}

export type ExtendedBigIntComponent = ReturnType<typeof createExtendedBigIntComponent>;
export function createExtendedBigIntComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { value: Type.BigInt }, options);
}

export function createExtendedStringComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { value: Type.String }, options);
}

export function createExtendedCoordComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { x: Type.Number, y: Type.Number }, options);
}

export function createExtendedBoolComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { value: Type.Boolean }, options);
}

export function createExtendedEntityComponent<M extends Metadata>(world: World, options?: Options<M>) {
  return createExtendedComponent(world, { value: Type.Entity }, options);
}
