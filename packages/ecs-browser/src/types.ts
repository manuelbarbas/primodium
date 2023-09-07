import { Component, ComponentValue, Entity, Schema } from "@latticexyz/recs";

export type SetField<S extends Schema> = (
  component: AnyComponentWithContract<S>,
  entity: Entity,
  newValue: ComponentValue<S>
) => void;

export type AnyComponentWithContract<S extends Schema> = Component<
  S,
  {
    componentName: string;
    tableName: `${string}:${string}`;
    keySchema: Record<string, string>;
    valueSchema: Record<string, string>;
  }
>;

export function hasContract<S extends Schema>(
  component: Component<S>
): component is AnyComponentWithContract<S> {
  return component.metadata?.tableName !== undefined;
}
