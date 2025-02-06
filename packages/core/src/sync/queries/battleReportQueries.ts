import { Hex } from "viem";

import { ContractTableDefs, Entity } from "@primodiumxyz/reactive-tables";
import { DecodedIndexerQuery } from "@primodiumxyz/sync-stack/types";

export const getBattleReportQuery = ({
  tables,
  playerEntity,
  worldAddress,
}: {
  tables: ContractTableDefs;
  worldAddress: Hex;
  playerEntity: Entity;
}): DecodedIndexerQuery => {
  return {
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
  };
};
