import {
  AnyComponent,
  Component,
  ComponentValue,
  Entity,
  Schema,
} from "@latticexyz/recs";

export type SetContractComponentFunction<T extends Schema> = (
  entity: Entity,
  component: Component<T, { contractId: string }>,
  newValue: ComponentValue<T>
) => void;

export type AnyComponentWithContract = Component<
  Schema,
  { contractId: string }
>;

export function hasContract(
  component: AnyComponent
): component is AnyComponentWithContract {
  return component.metadata?.contractId !== undefined;
}

export type Cheatcodes = Record<string, Cheatcode>;

export type Cheatcode = {
  function: (...args: unknown[]) => unknown;
  params: { name: string; type: "number" | "string" | "boolean" }[];
};
