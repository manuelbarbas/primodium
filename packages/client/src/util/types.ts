import { SetupContractConfig } from "@latticexyz/std-client";
import { Step } from "walktour";

export type NetworkConfig = {
  config: SetupContractConfig;
  defaultWalletAddress: string | undefined;
};
export type BlockTypeActionComponent = {
  action: () => void;
};

export type SimpleCardinal = "up" | "down" | "left" | "right";

export interface TourStep extends Step {
  narration?: JSX.Element;
  hideUI?: boolean;
}
