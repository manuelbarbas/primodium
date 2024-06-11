import { EntityType } from "@/lib/constants";
import { Table } from "@latticexyz/store/internal";
import { DecodedIndexerQuery } from "@primodiumxyz/sync-stack/types";
import { Hex } from "viem";

export const getSecondaryQuery = ({
  tables,
  worldAddress,
}: {
  tables: Record<string, Table>;
  worldAddress: Hex;
}): DecodedIndexerQuery => {
  return {
    address: worldAddress as Hex,
    queries: [
      // leaderboard
      { tableId: tables.Points.tableId },
      // alliance
      { tableId: tables.Alliance.tableId },
      { tableId: tables.PlayerAlliance.tableId },
      // starbelt
      { tableId: tables.Home.tableId },
      // asteroid
      {
        tableId: tables.Asteroid.tableId,
        include: [
          { tableId: tables.OwnedBy.tableId },
          { tableId: tables.Position.tableId },
          { tableId: tables.ReversePosition.tableId, on: "entity" },
          { tableId: tables.Level.tableId },
        ],
      },
      // shard
      {
        tableId: tables.ShardAsteroid.tableId,
        include: [
          { tableId: tables.OwnedBy.tableId },
          { tableId: tables.Position.tableId },
          { tableId: tables.ReversePosition.tableId, on: "entity" },
          { tableId: tables.LastConquered.tableId },
          { tableId: tables.ShardAsteroidIndex.tableId },
        ],
      },
      // wormhole
      { tableId: tables.Wormhole.tableId },
      {
        tableId: tables.Position.tableId,
        where: { column: "entity", operation: "eq", value: EntityType.WormholeBase },
      },
      // fleets
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
  };
};
