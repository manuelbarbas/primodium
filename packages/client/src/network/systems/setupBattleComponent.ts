import { Has, defineSystem } from "@latticexyz/recs";
import { world } from "../world";
import {
  BattleAttacker,
  BattleBlockNumber,
  BattleDefender,
  BattleRaidResult,
  BattleResult,
  BattleSpaceRock,
} from "../components/chainComponents";
import { Battle } from "../components/clientComponents";

export const setupBattleComponent = () => {
  const query = [
    Has(BattleAttacker),
    Has(BattleDefender),
    Has(BattleResult),
    Has(BattleSpaceRock),
    Has(BattleBlockNumber),
  ];
  defineSystem(world, query, ({ entity }) => {
    const entityId = world.entities[entity];
    if (Battle.has(entityId)) return;
    const attacker = BattleAttacker.get(entityId);
    const defender = BattleDefender.get(entityId);
    const spaceRock = BattleSpaceRock.get(entityId)?.value;
    const blockNumber = BattleBlockNumber.get(entityId)?.value;
    const raid = BattleRaidResult.get(entityId);
    const result = BattleResult.get(entityId);

    if (!attacker || !defender || !spaceRock || !result || !blockNumber) return;

    Battle.set({
      attacker: attacker.participantEntity,
      defender: defender.participantEntity,
      attackerUnitCounts: attacker.unitCounts,
      defenderUnitCounts: defender.unitCounts,
      attackerUnitTypes: attacker.unitTypes,
      defenderUnitTypes: defender.unitTypes,
      attackerUnitLevels: attacker.unitLevels,
      defenderUnitLevels: defender.unitLevels,
      winner: result.winner,
      attackerUnitsLeft: result.attackerUnitsLeft,
      defenderUnitsLeft: result.defenderUnitsLeft,
      resources: raid?.resources,
      defenderValuesBeforeRaid: raid?.defenderValuesBeforeRaid,
      raidedAmount: raid?.raidedAmount,
      blockNumber,
      spaceRock,
    });
  });
};
