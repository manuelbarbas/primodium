import { Component } from "@latticexyz/recs";
import { ExtendedContractComponent, extendContractComponent } from "./ExtendedComponent";
import { ContractComponent } from "@/types";

export function extendContractComponents<C extends Components>(components: C): ExtendedContractComponents<C> {
  return Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, extendContractComponent(value)])
  ) as ExtendedContractComponents<C>;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Components = { [key: string]: Component<any, any, any> };

type TransformContractComponent<T> = T extends ContractComponent<infer S, infer U>
  ? ExtendedContractComponent<S, U>
  : never;

export type ExtendedContractComponents<C extends Components> = {
  [K in keyof C]: TransformContractComponent<C[K]>;
};
