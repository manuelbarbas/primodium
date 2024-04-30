import { EntityToResourceImage, EntityToUnitImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { FaTimes, FaTrophy } from "react-icons/fa";
import { Navigator } from "src/components/core/Navigator";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { usePlayerOwner } from "src/hooks/usePlayerOwner";
import { components } from "src/network/components";
import { getEntityTypeName, toRomanNumeral } from "src/util/common";
import { EntityType } from "src/util/constants";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { formatResourceCount } from "src/util/number";

export const UnitStatus: React.FC<{
  unit: Entity;
  casualties: bigint;
  unitsAtStart: bigint;
  level: bigint;
}> = ({ unit, unitsAtStart, casualties, level }) => {
  return (
    <div className={`w-full border-b border-b-slate-700 text-xs bg-slate-800`}>
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center justify-center">
          <img
            key={`unit-${unit}`}
            src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
            className={`border border-secondary w-8 h-8 p-1`}
          />
          <p className="bg-primary text-xs p-1 uppercase font-bold">
            {(unitsAtStart - casualties).toLocaleString()} LEFT
          </p>
          {getEntityTypeName(unit)} {toRomanNumeral(Number(level))}
        </div>
        <div className="flex gap-1 p-1 px-2 text-xs bg-slate-900 items-center uppercase font-bold">
          <p className="text-rose-500">{casualties.toLocaleString()}</p>
          LOST
        </div>
      </div>
    </div>
  );
};

export const BattleDetails: React.FC<{
  battleEntity: Entity;
}> = ({ battleEntity }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const battle = components.Battle.use(battleEntity);
  const attackingPlayer = usePlayerOwner(battle?.attacker as Entity);
  const defendingPlayer = usePlayerOwner(battle?.defender as Entity);
  const playerIsAttacker = playerEntity === attackingPlayer;
  const winningPlayer = usePlayerOwner(battle?.winner as Entity);
  const attackerIsFleet = components.IsFleet.use(battle?.attacker);
  const defenderIsFleet = components.IsFleet.use(battle?.defender);
  const position = components.Position.use(battle?.rock as Entity);

  if (!battle) return <></>;

  const attackerDetails = Object.values(battle.participants).find((p) => p.entity === battle.attacker);
  const defenderDetails = Object.values(battle.participants).find((p) => p.entity === battle.defender);
  const [playerDetails, enemyDetails] = playerIsAttacker
    ? [attackerDetails, defenderDetails]
    : [defenderDetails, attackerDetails];
  const [playerAllies, enemyAllies] = playerIsAttacker
    ? [battle.aggressorAllies, battle.targetAllies]
    : [battle.targetAllies, battle.aggressorAllies];

  return (
    <Navigator.Screen
      title="BattleDetails"
      className="relative gap-3 flex flex-col items-center text-white h-full w-full overflow-y-hidden p-1 mb-1 "
    >
      <div className="relative bg-slate-800 pixel-images p-3 w-full h-full overflow-y-scroll scrollbar">
        <div className="flex flex-col items-center gap-3">
          {playerEntity === winningPlayer && (
            <div className="bg-green-600 p-1 px-4  flex flex-col items-center border border-green-400">
              <FaTrophy size={24} />
              <p className="font-bold text-2xl">WON</p>
            </div>
          )}
          {playerEntity !== winningPlayer && (
            <div className="bg-rose-600 p-1 px-4  flex flex-col items-center border border-rose-400">
              <FaTimes size={24} />
              <p className="font-bold text-2xl">LOST</p>
            </div>
          )}
          <hr className="border-t border-secondary/40 w-full" />

          <div className="grid grid-cols-[1fr_3rem_1fr] gap-2 text-sm items-center justify-center">
            <div className="h-full flex flex-col">
              <p className="flex flex-col font-bold text-xs text-accent">ATTACKER</p>
              <div
                className={`flex flex-col justify-center items-center bg-slate-700 p-2 border ${
                  battle.winner == battle.attacker ? "border-green-500" : "border-rose-500"
                }`}
              >
                <div className="flex gap-1 items-center">
                  <p className="font-bold text-xs uppercase text-white">
                    {attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}
                  </p>
                  <img src={attackerIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="w-6 h-6" />
                </div>
                <AccountDisplay player={attackingPlayer} className="text-xs opacity-80" />
              </div>
            </div>
            <p className="grid place-items-center uppercase font-bold">vs</p>
            <div className="h-full flex flex-col">
              <p className="font-bold text-xs text-accent">DEFENDER</p>

              <div
                className={`flex flex-col justify-center items-center bg-slate-700 p-2 border ${
                  battle.winner == battle.defender ? "border-green-500" : "border-rose-500"
                }`}
              >
                <div className="flex gap-1 items-center">
                  <p className="font-bold text-xs uppercase text-white">
                    {defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(battle.defender)}
                  </p>
                  <img src={defenderIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="w-6 h-6" />
                </div>
                <AccountDisplay player={defendingPlayer} className="text-xs opacity-80" />
              </div>
            </div>
          </div>

          <hr className="border-t border-primary/40 w-full" />

          <p className="p-1 text-xs font-bold text-accent flex justify-start w-full">YOU</p>
          {!playerDetails && (
            <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
              Nothing to report
            </div>
          )}
          {playerDetails && (
            <div className="w-full">
              <div className="w-full overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col p-2 gap-2 scrollbar">
                {!!playerDetails.encryptionAtStart &&
                  !!playerDetails.encryptionAtEnd &&
                  playerDetails.encryptionAtStart !== playerDetails.encryptionAtEnd && (
                    <div className="bg-error font-bold uppercase text-center">
                      LOST
                      {formatResourceCount(
                        EntityType.Encryption,
                        playerDetails.encryptionAtStart - playerDetails.encryptionAtEnd
                      )}
                      ENCRYPTION
                    </div>
                  )}
                {Object.entries(playerDetails.units).length > 0 && (
                  <div className="w-full h-full">
                    {Object.entries(playerDetails.units).map(([entity, unit], i) => (
                      <UnitStatus
                        unit={entity as Entity}
                        casualties={unit.casualties}
                        unitsAtStart={unit.unitsAtStart}
                        level={unit.level}
                        key={`unit-${i + 1}`}
                      />
                    ))}
                  </div>
                )}
                {Object.entries(playerDetails.resources).length !== 0 && (
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(playerDetails.resources).map(([resource, data], i) => {
                      const resourceDelta = data.resourcesAtEnd - data.resourcesAtStart;
                      return (
                        <div
                          key={`resource-${i}`}
                          className={`border ${
                            resourceDelta > 0n ? "border-green-800" : "border-rose-800"
                          } flex items-center`}
                        >
                          <img src={EntityToResourceImage[resource] ?? ""} className={`w-8 h-8 p-1`} />

                          <p className={`grid place-items-center text-sm p-1 uppercase font-bold w-full h-full`}>
                            {resourceDelta > 0n ? "+" : ""}
                            {formatResourceCount(resource as Entity, resourceDelta, {
                              short: true,
                              showZero: true,
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {playerAllies.length > 0 && (
                <>
                  <p className="p-1 text-xs font-bold text-accent/70 flex justify-start w-full">ALLIES</p>
                  <div className="grid grid-cols-3 gap-1 w-full">
                    {playerAllies.map((ally) => (
                      <Ally key={`ally-${ally}`} entity={ally} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <p className="p-1 text-xs font-bold text-accent flex justify-start w-full">ENEMY</p>
          {!enemyDetails && (
            <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
              Nothing to report
            </div>
          )}
          {enemyDetails && (
            <div className="w-full">
              <div className="w-full overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col scrollbar p-2">
                {!!enemyDetails.encryptionAtStart &&
                  !!enemyDetails.encryptionAtEnd &&
                  enemyDetails.encryptionAtStart !== enemyDetails.encryptionAtEnd && (
                    <div className="bg-error font-bold uppercase text-center">
                      LOST
                      {formatResourceCount(
                        EntityType.Encryption,
                        enemyDetails.encryptionAtStart - enemyDetails.encryptionAtEnd
                      )}
                      ENCRYPTION
                    </div>
                  )}
                {Object.entries(enemyDetails.units).length > 0 && (
                  <div className="w-full h-full">
                    {Object.entries(enemyDetails.units).map(([entity, unit], i) => (
                      <UnitStatus
                        unit={entity as Entity}
                        casualties={unit.casualties}
                        unitsAtStart={unit.unitsAtStart}
                        level={unit.level}
                        key={`unit-${i + 1}`}
                      />
                    ))}
                  </div>
                )}
                {Object.entries(enemyDetails.resources).length !== 0 && (
                  <div className="grid grid-cols-6 gap-1 p-2">
                    {Object.entries(enemyDetails.resources).map(([resource, data], i) => {
                      const resourceDelta = data.resourcesAtEnd - data.resourcesAtStart;
                      return (
                        <div
                          key={`resource-${i}`}
                          className={`border ${
                            resourceDelta > 0n ? "border-green-800" : "border-rose-800"
                          } flex items-center`}
                        >
                          <img src={EntityToResourceImage[resource] ?? ""} className={`w-8 h-8 p-1`} />

                          <p className={`grid place-items-center text-sm p-1 uppercase font-bold w-full h-full`}>
                            {resourceDelta > 0n ? "+" : ""}
                            {formatResourceCount(resource as Entity, resourceDelta, {
                              short: true,
                              showZero: true,
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {enemyAllies.length > 0 && (
                <>
                  <p className="p-1 text-xs font-bold text-accent/70 flex justify-start w-full">ALLIES</p>
                  <div className="grid grid-cols-3 gap-1 w-full">
                    {enemyAllies.map((ally) => (
                      <Ally key={`ally-${ally}`} entity={ally} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 flex flex-col items-end gap-1 text-xs p-2">
          <p className="opacity-70 font-bold">
            {new Date(Number(battle.timestamp * 1000n)).toLocaleString(undefined, {
              hour: "numeric",
              minute: "numeric",
              hour12: false,
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="opacity-50 font-bold">
            [{position?.x ?? 0},{position?.y ?? 0}] {entityToRockName(battle.rock)}
          </p>
        </div>
      </div>
      <Navigator.BackButton className="btn btn-primary btn-xs" />
    </Navigator.Screen>
  );
};

const Ally = ({ entity }: { entity: Entity }) => {
  const isFleet = components.IsFleet.use(entity)?.value;
  return (
    <div
      className={`flex bg-black/10 border  text-xs justify-center items-center gap-2 p-1 w-full border-secondary/50`}
    >
      {isFleet ? entityToFleetName(entity) : entityToRockName(entity)}
      <img src={isFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="w-4" />
    </div>
  );
};
