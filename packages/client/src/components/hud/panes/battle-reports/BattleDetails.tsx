import { Entity } from "@latticexyz/recs";
import { EResource, EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { FaTimes, FaTrophy } from "react-icons/fa";
import { Navigator } from "src/components/core/Navigator";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName, shortenAddress, toRomanNumeral } from "src/util/common";
import {
  BackgroundImage,
  ResourceEntityLookup,
  ResourceImage,
  ResourceType,
  UnitEntityLookup,
} from "src/util/constants";
import { Hex } from "viem";

export const UnitStatus: React.FC<{
  unit: Entity;
  unitsLeft: bigint;
  count: bigint;
  level: bigint;
}> = ({ unit, unitsLeft, count, level }) => {
  console.log("unit:", unit);
  if (unitsLeft - count <= 0n && count === 0n) return <></>;

  return (
    <div className={`w-full border-b border-b-slate-700 text-xs bg-slate-800`}>
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center justify-center">
          <img
            key={`unit-${unit}`}
            src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
            className={`border border-cyan-400 w-6 h-6 rounded-xs`}
          />
          <p className="rounded-md bg-cyan-700 text-xs p-1">x{unitsLeft.toLocaleString()}</p>
          {getBlockTypeName(unit)} {toRomanNumeral(Number(level))}
        </div>
        <div className="relative flex gap-1 p-1 px-2 bg-slate-900 rounded-md items-center">
          <p className={`font-bold ${unitsLeft - count < 0 ? "text-rose-500" : "text-green-500"}`}>
            {Math.abs(Math.min(Number(unitsLeft - count), 0))}
          </p>{" "}
          LOST
        </div>
      </div>
    </div>
  );
};

export const BattleDetails: React.FC<{
  battleEntity: Entity;
}> = ({ battleEntity }) => {
  const playerEntity = useMud().network.playerEntity;
  const raid = components.RaidResult.use(battleEntity);
  const battle = useMemo(() => format(battleEntity), [battleEntity]);

  if (!battle) return <></>;

  const playersUnits = playerEntity === battle.attacker ? battle.attackerUnits : battle.defenderUnits;
  console.log("players units:", playersUnits);
  const enemyUnits = playerEntity === battle.attacker ? battle.defenderUnits : battle.attackerUnits;

  return (
    <Navigator.Screen
      title="BattleDetails"
      className="relative gap-3 flex flex-col items-center text-white h-full w-full scrollbar overflow-y-auto p-1 mb-1 "
    >
      <div className="relative bg-slate-800 pixel-images border border-cyan-400 p-3 w-full rounded-md">
        <div className="flex flex-col items-center space-y-3">
          {playerEntity === battle.winner && (
            <div className="bg-green-600 p-1 px-4 rounded-md flex flex-col items-center border border-green-400">
              <FaTrophy size={24} />
              <p className="font-bold text-2xl">WON</p>
            </div>
          )}
          {playerEntity !== battle.winner && (
            <div className="bg-rose-600 p-1 px-4 rounded-md flex flex-col items-center border border-rose-400">
              <FaTimes size={24} />
              <p className="font-bold text-2xl">LOST</p>
            </div>
          )}
          <hr className="border-t border-cyan-600/40 w-full" />

          <div className="flex gap-2 text-sm items-center justify-center">
            <div className="bg-slate-700 p-2 rounded-md border border-rose-500 w-32">
              <p className="font-bold text-xs text-cyan-400">ATTACKER</p>
              {battle.attacker === playerEntity ? "You" : shortenAddress(battle.attacker)}
            </div>
            vs
            <div className="bg-slate-700 p-2 rounded-md border border-green-600 w-32">
              <p className="font-bold text-xs text-cyan-400">DEFENDER</p>
              {battle.defender === playerEntity ? "You" : shortenAddress(battle.defender)}
            </div>
          </div>

          <hr className="border-t border-cyan-600/40 w-full" />

          {battle.resources.length !== 0 && (
            <div className="flex flex-col justify-center items-center gap-2 bg-slate-900 p-2 px-5 rounded-md border border-slate-700 text-sm">
              <p className="text-lg font-bold leading-none">{playerEntity === battle.winner ? "REWARDS" : "RAIDED"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {battle.resources.map((resource, i) => {
                  if (!resource.amount) return;

                  return (
                    <ResourceIconTooltip
                      key={`resource-${i}`}
                      playerEntity={playerEntity}
                      image={ResourceImage.get(resource.id) ?? ""}
                      resource={resource.id}
                      name={getBlockTypeName(resource.id)}
                      amount={resource.amount}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-full">
            <p className="p-1 text-xs font-bold text-cyan-400">YOUR FLEET STATUS</p>
            <div className="w-full rounded-md overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col items-center justify-center scrollbar">
              {playersUnits.length === 0 && (
                <p className="text-sm font-bold text-slate-400 text-center">NO FLEET FOUND</p>
              )}
              {playersUnits.length !== 0 && (
                <div className="w-full h-full">
                  {playersUnits.map((unit, i) =>
                    unit ? (
                      <UnitStatus
                        unit={unit.type}
                        unitsLeft={unit.unitsLeft}
                        count={unit.count}
                        level={unit.level}
                        key={`unit-${i + 1}`}
                      />
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <p className="p-1 text-xs font-bold text-cyan-400">ENEMY FLEET STATUS</p>
            <div className="w-full rounded-md overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col items-center justify-center scrollbar">
              {enemyUnits.length === 0 && (
                <p className="text-sm font-bold text-slate-400 text-center">NO FLEET FOUND</p>
              )}
              {enemyUnits.length !== 0 && (
                <div className="w-full h-full">
                  {enemyUnits.map((unit, i) =>
                    unit ? (
                      <UnitStatus
                        unit={unit.type}
                        unitsLeft={unit.unitsLeft}
                        count={unit.count}
                        level={unit.level}
                        key={`unit-${i + 1}`}
                      />
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 flex gap-1 text-xs p-2">
          {/* <p className="opacity-30">BLOCK</p> */}
          <p className="opacity-50 font-bold">{new Date(Number(battle.timestamp * 1000n)).toLocaleDateString()}</p>
        </div>
        <div className="absolute top-0 left-0 flex gap-1 text-xs p-2">
          <p className="opacity-50 font-bold">{raid ? "RAID" : "INVASION"}</p>
        </div>
      </div>
      <div className="sticky bottom-0 w-full h-full flex items-center justify-center">
        <Navigator.BackButton />
      </div>
    </Navigator.Screen>
  );
};

const format = (battleEntity: Entity) => {
  const battle = components.BattleResult.get(battleEntity);

  if (!battle) return null;

  const attackerUnits = battle.attackerStartingUnits.map((startingUnitCount, i) => {
    const unitEntity = UnitEntityLookup[(i + 1) as EUnit];
    if (!unitEntity) return;

    return {
      type: unitEntity,
      count: startingUnitCount,
      unitsLeft: battle.attackerUnitsLeft[i],
      level: components.UnitLevel.getWithKeys({ entity: battle.attacker as Hex, unit: unitEntity as Hex })?.value ?? 1n,
    };
  });

  const defenderUnits = battle.defenderStartingUnits.map((startingUnitCount, i) => {
    const unitEntity = UnitEntityLookup[(i + 1) as EUnit];
    if (!unitEntity) return;

    return {
      type: unitEntity,
      count: startingUnitCount,
      unitsLeft: battle.defenderUnitsLeft[i],
      level: components.UnitLevel.getWithKeys({ entity: battle.defender as Hex, unit: unitEntity as Hex })?.value ?? 1n,
    };
  });

  const resources = (components.RaidResult.get(battleEntity)?.raidedAmount ?? []).map((resourceCount, i) => {
    const resourceEntity = ResourceEntityLookup[i as EResource];

    return {
      id: resourceEntity,
      amount: resourceCount,
      type: ResourceType.Resource,
    };
  });

  return {
    entity: battleEntity,
    attacker: battle.attacker,
    defender: battle.defender,
    winner: battle.winner,
    attackerUnits,
    defenderUnits,
    resources: resources,
    totalCargo: battle.totalCargo,
    timestamp: battle.timestamp,
    spaceRock: battle.rock,
  };
};
