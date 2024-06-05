import { createCore } from "@/createCore";
import { chainConfigs } from "@/network/config/chainConfigs";
import { expect, test } from "vitest";
import worldsJson from "contracts/worlds.json";
import { worldInput } from "contracts/mud.config";
import { Address } from "viem";
import { otherTables } from "@/network/otherTables";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Entity } from "@latticexyz/recs";

const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

const worldAddress = worlds[chainConfigs.dev.id]?.address as Address;
if (!worldAddress) throw new Error(`No world address found for chain ${chainConfigs.dev.id}.`);
const config = {
  chain: chainConfigs.dev,
  worldAddress,
  initialBlockNumber: BigInt(0),
};

const randomPrivateKey = generatePrivateKey();
const randomAddress = privateKeyToAccount(randomPrivateKey).address;
test("core returns an object", async () => {
  await createCore(config);
});

test("core contains mud tables", async () => {
  const core = await createCore(config);
  const coreComponentKeys = Object.keys(core.components);
  const mudTableKeys = Object.keys(worldInput.tables);
  const otherTableKeys = Object.keys(otherTables);

  for (const table of [...otherTableKeys, ...mudTableKeys]) {
    expect(coreComponentKeys).toContain(table);
  }
});

test("core contains random utility", async () => {
  const core = await createCore(config);

  const shardName = core.utils.entityToShardName(randomAddress as Entity);

  expect(shardName).toEqual("UNKNOWN");
});

test("core contains identical config", async () => {
  const core = await createCore(config);

  expect(core.config).toEqual(config);
});
