import { Component } from "@latticexyz/recs";
import { SetupNetworkResult } from "../types";
import { ExtendedComponent, extendComponent } from "./customComponents/Component";

export function createComponents({ components }: SetupNetworkResult) {
  const extendedComponents = Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, extendComponent(value)])
  ) as ExtendedComponents<typeof components>;
  return {
    ...extendedComponents,
    // add your client components or overrides here
  };
}

type Components = SetupNetworkResult["components"];

type TransformComponent<T> = T extends Component<infer S, infer M, infer T> ? ExtendedComponent<S, M, T> : never;

export type ExtendedComponents<C extends Components> = {
  [K in keyof C]: TransformComponent<C[K]>;
};
