import { createComponents } from "../components";
import { setupNetwork } from "./setupNetwork";

export async function setup() {
  const network = await setupNetwork();
  const components = createComponents(network);
  return {
    network,
    components,
  };
}
