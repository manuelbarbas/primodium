import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { SetupContractConfig } from "@latticexyz/std-client";
import { Address } from "wagmi";
import { Step } from "walktour";
import { Action } from "./constants";
import { Coord } from "@latticexyz/utils";

export type ContractCoord = Coord & {parent: EntityID};

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

export type HotbarItem = {
  blockType: EntityID;
  keybind: KeybindActions;
  action?: Action;
};

export type Hotbar = {
  name: string;
  icon: string;
  items: HotbarItem[];
};
