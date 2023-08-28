import { world } from "src/network/world";
import newComponent from "./Component";
import { Type, defineComponentSystem } from "@latticexyz/recs";
import {
  BattleAttacker,
  BattleDefender,
  BattleResult,
  BattleSpaceRock,
} from "../chainComponents";

export const BattleComponent = () => {
  const component = newComponent(world, {
    attacker: Type.Entity,
    defender: Type.Entity,
    winner: Type.Entity,
    attackerUnitTypes: Type.EntityArray,
    defenderUnitTypes: Type.EntityArray,
    attackerUnitCounts: Type.NumberArray,
    defenderUnitCounts: Type.NumberArray,
    attackerUnitLevels: Type.NumberArray,
    defenderUnitLevels: Type.NumberArray,
    attackerUnitsLeft: Type.NumberArray,
    defenderUnitsLeft: Type.NumberArray,
    spaceRock: Type.Entity,
  });

  defineComponentSystem(world, BattleResult, ({ entity, value: [result] }) => {
    if (!result) return;
    const entityId = world.entities[entity];
    const attacker = BattleAttacker.get(entityId);
    const defender = BattleDefender.get(entityId);
    const spaceRock = BattleSpaceRock.get(entityId)?.value;

    if (!attacker || !defender || !spaceRock) return;
    component.set({
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
      spaceRock,
    });
  });
  return {
    ...component,
  };
};
