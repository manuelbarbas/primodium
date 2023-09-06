import { SetupNetworkResult } from "../types";
import { extendComponent } from "./customComponents/Component";

export function createComponents({ components }: SetupNetworkResult) {
  const extendedComponents = Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, extendComponent(value)])
  );
  return {
    ...extendedComponents,
    // add your client components or overrides here
  };
}
