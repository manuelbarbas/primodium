import { Component, ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";

export type SetField<S extends Schema> = (
  entity: Entity,
  component: AnyComponentWithContract<S>,
  newValue: ComponentValue<S>
) => void;

export type AnyComponentWithContract<S extends Schema> = Component<
  S,
  {
    componentName: string;
    tableName: `${string}:${string}`;
    keySchema: Record<string, StaticAbiType>;
    valueSchema: Record<string, StaticAbiType>;
  }
>;

export function hasContract<S extends Schema>(
  component: Component<S>
): component is AnyComponentWithContract<S> {
  return component.metadata?.tableName !== undefined;
}
