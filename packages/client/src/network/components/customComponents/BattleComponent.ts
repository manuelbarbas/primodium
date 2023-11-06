import { ComponentValue, Type } from "@latticexyz/recs";
import { world } from "src/network/world";
import { createExtendedComponent } from "./ExtendedComponent";

export const createBattleComponent = () => {
  const component = createExtendedComponent(world, {
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
    resources: Type.OptionalEntityArray,
    defenderValuesBeforeRaid: Type.OptionalNumberArray,
    raidedAmount: Type.OptionalNumberArray,
    blockNumber: Type.Number,
    spaceRock: Type.Entity,
  });

  const format = (battle: ComponentValue<typeof component.schema>) => {
    const attackerUnits = [];
    const defenderUnits = [];
    if (battle.attackerUnitTypes.length !== battle.attackerUnitCounts.length)
      throw new Error("attackerUnitTypes and attackerUnitCounts must be the same length");

    for (let i = 0; i < battle.attackerUnitTypes.length; i++) {
      attackerUnits.push({
        type: battle.attackerUnitTypes[i],
        count: battle.attackerUnitCounts[i],
        level: battle.attackerUnitLevels[i],
        unitsLeft: battle.attackerUnitsLeft[i],
      });
      defenderUnits.push({
        type: battle.defenderUnitTypes[i],
        count: battle.defenderUnitCounts[i],
        level: battle.defenderUnitLevels[i],
        unitsLeft: battle.defenderUnitsLeft[i],
      });
    }
    return {
      attacker: battle.attacker,
      defender: battle.defender,
      winner: battle.winner,
      attackerUnits,
      defenderUnits,
      resources: battle.resources,
      defenderValuesBeforeRaid: battle.defenderValuesBeforeRaid,
      raidedAmount: battle.raidedAmount,
      blockNumber: battle.blockNumber,
      spaceRock: battle.spaceRock,
    };
  };
  return {
    ...component,
    format,
  };
};
