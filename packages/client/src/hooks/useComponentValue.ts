// from: https://github.com/latticexyz/mud/blob/43a75626592e01a1a2fa2351ebc75541a64f0d18/packages/react/src/useComponentValue.ts
import {
  Component,
  ComponentValue,
  defineQuery,
  EntityID,
  getComponentValue,
  Has,
  isComponentUpdate,
  Metadata,
  Schema,
} from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { singletonIndex, world } from "src/network/world";

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityID: EntityID,
  defaultValue: ComponentValue<S>
): ComponentValue<S>;

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityID?: EntityID
): ComponentValue<S> | undefined;

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityID?: EntityID,
  defaultValue?: ComponentValue<S>
) {
  const [value, setValue] = useState(() => {
    const entity = entityID
      ? world.entityToIndex.get(entityID)
      : singletonIndex;
    return entity != null ? getComponentValue(component, entity) : undefined;
  });

  useEffect(() => {
    console.log("component updated", component.id);
  }, [component]);
  useEffect(() => {
    // component or entity changed, update state to latest value

    const entity = entityID
      ? world.entityToIndex.get(entityID)
      : singletonIndex;
    setValue(entity != null ? getComponentValue(component, entity) : undefined);
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
  }, [component, entityID]);

  return value ?? defaultValue;
}
