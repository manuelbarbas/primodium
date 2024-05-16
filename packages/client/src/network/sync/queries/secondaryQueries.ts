import type { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";

export const getSecondaryQuery = ({
  tables,
  world,
  indexerUrl,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
  worldAddress: Hex;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    query: {
      address: worldAddress as Hex,
      queries: [
        // leaderboard
        { tableId: tables.Points.tableId },
        // alliance
        { tableId: tables.Alliance.tableId },
        { tableId: tables.PlayerAlliance.tableId },
        // starbelt
        { tableId: tables.Home.tableId },
        {
          tableId: tables.Asteroid.tableId,
          include: [
            { tableId: tables.OwnedBy.tableId },
            { tableId: tables.Position.tableId },
            { tableId: tables.ReversePosition.tableId, on: "entity" },
            { tableId: tables.Level.tableId },
          ],
        },
        {
          tableId: tables.ShardAsteroid.tableId,
          include: [
            { tableId: tables.Position.tableId },
            { tableId: tables.ReversePosition.tableId, on: "entity" },
            { tableId: tables.LastConquered.tableId },
          ],
        },
        {
          tableId: tables.FleetMovement.tableId,
          include: [
            { tableId: tables.IsFleetEmpty.tableId },
            { tableId: tables.FleetStance.tableId },
            { tableId: tables.IsFleet.tableId },
            { tableId: tables.OwnedBy.tableId, on: "entity" },
            { tableId: tables.CooldownEnd.tableId },
          ],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
