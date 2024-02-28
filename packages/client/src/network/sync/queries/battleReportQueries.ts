import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import type { Sync } from "@primodiumxyz/sync-stack";

export const getBattleReportQuery = ({
  tables,
  world,
  indexerUrl,
  playerEntity,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
  worldAddress: Hex;
  playerEntity: Entity;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    query: {
      address: worldAddress as Hex,
      queries: [
        {
          tableId: tables.BattleResult.tableId,
          where: {
            column: "player",
            operation: "eq",
            value: playerEntity as Hex,
          },
          include: [
            {
              tableId: tables.BattleDamageDealtResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleDamageTakenResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleEncryptionResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleRaidResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleUnitResult.tableId,
              on: "battle_id",
            },
          ],
        },
        {
          tableId: tables.BattleResult.tableId,
          where: {
            column: "target_player",
            operation: "eq",
            value: playerEntity as Hex,
          },
          include: [
            {
              tableId: tables.BattleDamageDealtResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleDamageTakenResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleEncryptionResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleRaidResult.tableId,
              on: "battle_id",
            },
            {
              tableId: tables.BattleUnitResult.tableId,
              on: "battle_id",
            },
          ],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
