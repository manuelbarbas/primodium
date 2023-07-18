import { SetupContractConfig } from "@latticexyz/std-client";
import { Address } from "wagmi";
import { Step } from "walktour";

export type NetworkConfig = SetupContractConfig & {
  defaultWalletAddress?: Address;
  faucetUrl?: string;
  faucetMinDripAmount?: number;
};

export type BlockTypeActionComponent = {
  action: () => void;
};

export type SimpleCardinal = "up" | "down" | "left" | "right";

export interface TourStep extends Step {
  narration?: JSX.Element;
  hideUI?: boolean;
}
