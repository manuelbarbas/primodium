import { Entity } from "@latticexyz/recs";
import type { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";

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
            column: "player_entity",
            operation: "eq",
            value: playerEntity as Hex,
          },
          include: [
            {
              tableId: tables.BattleDamageDealtResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleDamageTakenResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleEncryptionResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleRaidResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleUnitResult.tableId,
              on: "battle_entity",
            },
          ],
        },
        {
          tableId: tables.BattleResult.tableId,
          where: {
            column: "target_player_entity",
            operation: "eq",
            value: playerEntity as Hex,
          },
          include: [
            {
              tableId: tables.BattleDamageDealtResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleDamageTakenResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleEncryptionResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleRaidResult.tableId,
              on: "battle_entity",
            },
            {
              tableId: tables.BattleUnitResult.tableId,
              on: "battle_entity",
            },
          ],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
