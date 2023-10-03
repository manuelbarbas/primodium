import { KeySchema } from "@latticexyz/protocol-parser";
import { Component, Schema } from "@latticexyz/recs";
import { createComponents } from "./components";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { setup } from "./setup";
import { setupNetwork } from "./setupNetwork";

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

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

export type SetupResult = Awaited<ReturnType<typeof setup>>;
