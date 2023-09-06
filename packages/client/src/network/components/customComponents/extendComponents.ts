import { Component } from "@latticexyz/recs";
import { ExtendedComponent, extendComponent } from "./ExtendedComponent";

export function extendComponents<C extends Components>(components: C): ExtendedComponents<C> {
  return Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, extendComponent(value)])
  ) as ExtendedComponents<C>;
}

type Components = { [key: string]: Component<any, any, any> };

type TransformComponent<T> = T extends Component<infer S, infer M, infer T> ? ExtendedComponent<S, M, T> : never;

export type ExtendedComponents<C extends Components> = {
  [K in keyof C]: TransformComponent<C[K]>;
};
