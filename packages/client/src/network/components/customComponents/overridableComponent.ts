import {
  Component,
  ComponentValue,
  EntityIndex,
  Metadata,
  OverridableComponent,
  Override,
  Schema,
  getComponentValue,
} from "@latticexyz/recs";
import { Subject } from "rxjs";

export function overridableComponent<
  S extends Schema,
  M extends Metadata,
  T = undefined
>(component: Component<S, M, T>): OverridableComponent<S, M, T> {
  let nonce = 0;

  const overrides = new Map<
    string,
    { update: Override<S, T>; nonce: number }
  >();
  const overriddenEntityValues = new Map<
    EntityIndex,
    Partial<ComponentValue<S, T>> | null
  >();
  const update$ = new Subject<{
    entity: EntityIndex;
    value: [ComponentValue<S, T> | undefined, ComponentValue<S, T> | undefined];
    component: Component<S, Metadata, T>;
  }>();

  // Internal function to set the current overridden component value and emit the update event
  function setOverriddenComponentValue(
    entity: EntityIndex,
    value?: Partial<ComponentValue<S, T>> | null
  ) {
    // Check specifically for undefined - null is a valid override
    const prevValue = getOverriddenComponentValue(entity);
    if (value !== undefined) overriddenEntityValues.set(entity, value);
    else overriddenEntityValues.delete(entity);
    update$.next({
      entity,
      value: [getOverriddenComponentValue(entity), prevValue],
      component: overriddenComponent,
    });
  }

  function addOverride(id: string, update: Override<S, T>) {
    overrides.set(id, { update, nonce: nonce++ });
    setOverriddenComponentValue(update.entity, update.value);
  }

  function removeOverride(id: string) {
    const affectedEntity = overrides.get(id)?.update.entity;
    overrides.delete(id);

    if (affectedEntity == null) return;

    const relevantOverrides = [...overrides.values()]
      .filter((o) => o.update.entity === affectedEntity)
      .sort((a, b) => (a.nonce < b.nonce ? -1 : 1));

    if (relevantOverrides.length > 0) {
      const lastOverride = relevantOverrides[relevantOverrides.length - 1];
      setOverriddenComponentValue(affectedEntity, lastOverride.update.value);
    } else {
      setOverriddenComponentValue(affectedEntity, undefined);
    }
  }

  function getOverriddenComponentValue(
    entity: EntityIndex
  ): ComponentValue<S, T> | undefined {
    const originalValue = getComponentValue(component, entity);
    const overriddenValue = overriddenEntityValues.get(entity);
    return (originalValue || overriddenValue) && overriddenValue !== null
      ? ({ ...originalValue, ...overriddenValue } as ComponentValue<S, T>)
      : undefined;
  }

  for (const key of Object.keys(component.values) as (keyof S)[]) {
    const originalGet = component.values[key].get;
    const originalHas = component.values[key].has;
    const originalKeys = component.values[key].keys;

    component.values[key].get = (entity: EntityIndex) => {
      const overriddenValue = overriddenEntityValues.get(entity);
      const originalValue = originalGet.call(component.values[key], entity);
      return overriddenValue && overriddenValue[key] != null
        ? overriddenValue[key]
        : originalValue;
    };

    component.values[key].has = (entity: EntityIndex) => {
      return (
        originalHas.call(component.values[key], entity) ||
        overriddenEntityValues.has(entity)
      );
    };

    component.values[key].keys = () => {
      return new Set([
        ...originalKeys.call(component.values[key]),
        ...overriddenEntityValues.keys(),
      ]).values();
    };
  }
  const overriddenComponent = {
    ...component,
    addOverride,
    removeOverride,
    update$,
    entities: () =>
      new Set([
        ...overriddenEntityValues.keys(),
        ...component.entities(),
      ]).values(),
  };

  return overriddenComponent;
}
