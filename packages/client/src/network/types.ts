import { KeySchema } from "@latticexyz/protocol-parser";
import { Component, Schema } from "@latticexyz/recs";
import useGame from "src/hooks/useGame";
import { createComponents } from "./components";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { setup } from "./setup/setup";
import { setupNetwork } from "./setup/setupNetwork";
import { setupPlayerAccount } from "./setup/setupPlayerAccount";
import { setupSessionAccount } from "./setup/setupSessionAccount";

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;
export type SetupResult = Awaited<ReturnType<typeof setup>>;
export type PlayerAccount = Awaited<ReturnType<typeof setupPlayerAccount>>;
export type SessionAccount = Awaited<ReturnType<typeof setupSessionAccount>>;
export type PartialGame = ReturnType<typeof useGame>;
export type Game = PartialGame &
  SetupResult & {
    playerAccount: PlayerAccount;
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
