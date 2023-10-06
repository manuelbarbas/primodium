import { SetupNetworkResult } from "src/network/types";
import { buildBuilding } from "./buildBuilding";

// todo: wrap each call in transaction loading and error handling
export default function createContractCalls(network: SetupNetworkResult) {
  return {
    buildBuilding,
  };
}
