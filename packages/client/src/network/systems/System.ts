import { EMPTY, Observable, concat, from } from "rxjs";
import {
  Component,
  ComponentUpdate,
  ComponentValue,
  EntityIndex,
  QueryFragment,
  Schema,
  UpdateType,
  defineEnterQuery,
  defineExitQuery,
  defineQuery,
  defineUpdateQuery,
  getComponentEntities,
  removeComponent,
  setComponent,
  toUpdateStream,
} from "@latticexyz/recs";
import type { world } from "src/network/world";

type World = typeof world;

/**
 * Create a system that is called on every update of the given observable.
 *
 * @remarks
 * Advantage of using this function over directly subscribing to the RxJS observable is that the system is registered in the `world` and
 * disposed when the `world` is disposed (eg. during a hot reload in development).
 *
 * @param world {@link World} object this system should be registered in.
 * @param observable$ Observable to react to.
 * @param system System function to run on updates of the `observable$`. System function gets passed the update events from the `observable$`.
 */
export function defineRxSystem<T>(
  world: World,
  observable$: Observable<T>,
  system: (event: T) => void,
  options = { namespace: undefined }
) {
  const subscription = observable$.subscribe(system);
  world.registerDisposer(
    () =>
      subscription === null || subscription === void 0
        ? void 0
        : subscription.unsubscribe(),
    options.namespace
  );
}
/**
 * Create a system that is called on every event of the given {@link defineUpdateQuery update query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Update query to react to.
 * @param system System function to run when the result of the given update query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineUpdateSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options = { runOnInit: true, namespace: undefined }
) {
  defineRxSystem(world, defineUpdateQuery(query, options), system, options);
}
/**
 * Create a system that is called on every event of the given {@link defineEnterQuery enter query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Enter query to react to.
 * @param system System function to run when the result of the given enter query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineEnterSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options = { runOnInit: true, namespace: undefined }
) {
  defineRxSystem(world, defineEnterQuery(query, options), system, options);
}

/**
 * Create a system that is called on every event of the given {@link defineExitQuery exit query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Exit query to react to.
 * @param system System function to run when the result of the given exit query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineExitSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options = { runOnInit: true, namespace: undefined }
) {
  defineRxSystem(world, defineExitQuery(query, options), system, options);
}

/**
 * Create a system that is called on every event of the given {@link defineQuery query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Query to react to.
 * @param system System function to run when the result of the given query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineSystem(
  world: World,
  query: QueryFragment[],
  system: (
    update: ComponentUpdate & {
      type: UpdateType;
    }
  ) => void,
  options = { runOnInit: true, namespace: undefined }
) {
  defineRxSystem(world, defineQuery(query, options).update$, system, options);
}

/**
 * Create a system that is called every time the given component is updated.
 *
 * @param world {@link World} object this system should be registered in.
 * @param component Component to whose updates to react.
 * @param system System function to run when the given component is updated.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities in the component when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineComponentSystem<S extends Schema>(
  world: World,
  component: Component<S>,
  system: (update: ComponentUpdate<S>) => void,
  options = { runOnInit: true, namespace: undefined }
) {
  const initial$ = (
    options === null || options === void 0 ? void 0 : options.runOnInit
  )
    ? from(getComponentEntities(component)).pipe(toUpdateStream(component))
    : EMPTY;
  defineRxSystem(world, concat(initial$, component.update$), system, options);
}

/**
 * Create a system to synchronize updates to one component with another component.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Result of `component` is added to all entites matching this query.
 * @param component Function returning the component to be added to all entities matching the given query.
 * @param value Function returning the component value to be added to all entities matching the given query.
 */
export function defineSyncSystem<T extends Schema>(
  world: World,
  query: QueryFragment[],
  component: (entity: EntityIndex) => Component<T>,
  value: (entity: EntityIndex) => ComponentValue<T>,
  options = { update: false, runOnInit: true, namespace: undefined }
) {
  defineSystem(
    world,
    query,
    ({ entity, type }) => {
      if (type === UpdateType.Enter)
        setComponent(component(entity), entity, value(entity));
      if (type === UpdateType.Exit) removeComponent(component(entity), entity);
      if (
        (options === null || options === void 0 ? void 0 : options.update) &&
        type === UpdateType.Update
      )
        setComponent(component(entity), entity, value(entity));
    },
    options
  );
}
