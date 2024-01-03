import { KeySchema } from "@latticexyz/protocol-parser";
import { Component, Schema } from "@latticexyz/recs";
import useSetupResult from "src/hooks/useSetupResult";
import { createComponents } from "./components";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { setup } from "./setup/setup";
import { setupBurnerAccount } from "./setup/setupBurnerAccount";
import { setupExternalAccount } from "./setup/setupExternalAccount";
import { setupNetwork } from "./setup/setupNetwork";

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;
export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;
export type SetupResult = Awaited<ReturnType<typeof setup>>;

export type BurnerAccount = Awaited<ReturnType<typeof setupBurnerAccount>>;
export type ExternalAccount = Awaited<ReturnType<typeof setupExternalAccount>>;
export type AnyAccount = BurnerAccount | ExternalAccount;

export type PartialMUD = ReturnType<typeof useSetupResult>;
export type MUD = PartialMUD &
  SetupResult & {
    playerAccount: AnyAccount;
  };

export type Components = ReturnType<typeof createComponents>;

export type ContractComponent<S extends Schema = Schema, TKeySchema extends KeySchema = KeySchema> = Component<
  S,
  {
    componentName: string;
    tableName: `${string}:${string}`;
    keySchema: TKeySchema;
    valueSchema: Record<string, string>;
  }
>;
