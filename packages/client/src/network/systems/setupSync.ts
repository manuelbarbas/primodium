import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";
import { components } from "../components";
import { MUD } from "../types";
import { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { hydrateSelectedAsteroid } from "../sync/indexer";

export const setupSync = (mud: MUD) => {
  const systemWorld = namespaceWorld(world, "systems");
  const networkConfig = getNetworkConfig();

  defineComponentSystem(systemWorld, components.SelectedRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    hydrateSelectedAsteroid(mud);
  });

  defineComponentSystem(systemWorld, components.ActiveRock, ({ value }) => {
    const spaceRock = value[0]?.value;

    if (!spaceRock || value[0]?.value === value[1]?.value) return;

    Sync.withQueryDecodedIndexerRecsSync({
      indexerUrl: networkConfig.indexerUrl!,
      tables: mud.network.tables,
      world: systemWorld,
      query: {
        address: networkConfig.worldAddress as Hex,
        queries: [
          //get buildings
          {
            tableName: mud.network.tables.Position.name!,
            where: {
              column: "parent",
              operation: "eq",
              value: spaceRock as Hex,
            },
            include: [
              {
                tableName: mud.network.tables.OwnedBy.name!,
              },
              {
                tableName: mud.network.tables.BuildingType.name!,
              },
              {
                tableName: mud.network.tables.IsActive.name!,
              },
              {
                tableName: mud.network.tables.Level.name!,
              },
            ],
          },
          //get expansion level
          {
            tableName: mud.network.tables.Level.name!,
            where: {
              column: "entity",
              operation: "eq",
              value: spaceRock as Hex,
            },
          },
        ],
      },
    }).start();
  });
};
