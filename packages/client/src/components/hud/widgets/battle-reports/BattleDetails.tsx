import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { EntityType } from "@/util/constants";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { EObjectives } from "contracts/config/enums";
import React, { useEffect } from "react";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { formatResourceCount } from "src/util/number";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";

interface UnitData {
  level: bigint;
  unitsAtStart: bigint;
  casualties: bigint;
}

interface UnitStatusProps {
  data: Record<string, UnitData>;
}

export const UnitStatus: React.FC<UnitStatusProps> = ({ data }) => {
  const units = Object.keys(data);

  return (
    <div className="w-full h-full bg-white/[.06] p-2">
      <div className="text-xs w-fit flex flex-col gap-2">
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <div className="col-span-1" />
          {units.map((unit, index) => (
            <div key={`unit-header-${index}`} className="text-center">
              <img
                src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
                alt={`${unit} icon`}
                className="w-8 h-8 mx-auto p-1"
              />
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <p className="font-bold text-left text-rose-500">Lost</p>
          {units.map((unit, index) => {
            const { casualties } = data[unit];
            return (
              <p key={`lost-${index}`} className="text-center text-rose-500">
                {casualties.toLocaleString()}
              </p>
            );
          })}
        </div>
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <p className="font-bold text-left">Remain</p>
          {units.map((unit, index) => {
            const { unitsAtStart, casualties } = data[unit];
            return (
              <p key={`remaining-${index}`} className="text-center">
                {(unitsAtStart - casualties).toLocaleString()}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ResourceStatus: React.FC<{
  resources: Record<Entity, { resourcesAtStart: bigint; resourcesAtEnd: bigint }>;
}> = ({ resources }) => {
  return (
    <div className="flex gap-3 p-1 bg-white/[.06]">
      {Object.entries(resources).map(([resource, data], i) => {
        const resourceDelta = data.resourcesAtEnd - data.resourcesAtStart;
        return (
          <div key={`resource-${i}`} className={`flex items-center`}>
            <img src={EntityToResourceImage[resource] ?? ""} className={`w-8 h-8 p-1`} />

            <p
              className={`grid place-items-center text-sm p-1 uppercase font-bold w-full h-full ${
                resourceDelta > 0n ? "text-success" : "text-error"
              }`}
            >
              {formatResourceCount(resource as Entity, resourceDelta, {
                short: true,
                showZero: true,
              })}
            </p>
          </div>
        );
      })}
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

  const attackingPlayer = battle?.attackingPlayer as Entity;
  const defendingPlayer = battle?.defendingPlayer as Entity;
  console.log({ defendingPlayer });
  const winningPlayer = battle?.winner === battle?.attacker ? attackingPlayer : defendingPlayer;
  const winnerIsAttacker = winningPlayer === attackingPlayer;
  const attackerIsFleet = components.IsFleet.use(battle?.attacker);
  const defenderIsFleet = components.IsFleet.use(battle?.defender);

  useEffect(() => {
    makeObjectiveClaimable(playerEntity, EObjectives.OpenBattleReport);
  }, []);

  if (!battle) return <></>;

  const attackerDetails = Object.values(battle.participants).find((p) => p.entity === battle.attacker);
  const defenderDetails = Object.values(battle.participants).find((p) => p.entity === battle.defender);

  return (
    <Navigator.Screen
      title="BattleDetails"
      className="relative gap-3 flex flex-col items-center text-white h-full w-full p-1 mb-1 "
    >
      <div className="relative bg-slate-800 pixel-images p-3 w-full h-full overflow-y-auto scrollbar">
        <div className="flex flex-col items-center gap-1">
          {playerEntity === winningPlayer && <p className="font-bold text-2xl text-success">VICTORY</p>}
          {playerEntity !== winningPlayer && <p className="font-bold text-2xl text-error">DEFEAT</p>}
          <p className="text-xs opacity-80">
            Battle at <span className="text-accent">{entityToRockName(battle.rock)!}</span>
          </p>
          <p className="text-xs opacity-60">
            {new Date(Number(battle.timestamp * 1000n)).toLocaleString(undefined, {
              hour: "numeric",
              minute: "numeric",
              hour12: false,
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <p className="p-1 text-xs font-bold text-accent flex justify-start w-full">Attacker</p>
          {!attackerDetails && (
            <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
              Nothing to report
            </div>
          )}
          {attackerDetails && (
            <div className="w-full flex gap-4 p-2 bg-white/[.06]">
              <div className="w-60 flex flex-col gap-1 justify-center items-center text-center text-sm">
                <img src={attackerIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="h-12 w-12" />
                <p className={`${winnerIsAttacker ? "text-success" : "text-error"}`}>
                  {attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}
                </p>
                <AccountDisplay raw player={attackingPlayer} noColor className="opacity-50" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                {defenderDetails?.encryptionAtEnd === 0n && (
                  <p className="opacity-70 text-xs">Gained control of {entityToRockName(battle.defender)}</p>
                )}
                {Object.entries(attackerDetails.units).length > 0 && <UnitStatus data={attackerDetails.units} />}

                {Object.entries(attackerDetails.resources).length !== 0 && (
                  <ResourceStatus resources={attackerDetails.resources} />
                )}
              </div>
            </div>
          )}

          {battle.aggressorAllies.length > 0 && (
            <div className="flex w-full items-center gap-2">
              <p className="text-xs font-bold text-accent/70 items-start justify-start">ALLIES</p>
              <div className="grid grid-cols-3 gap-1 w-full">
                {battle.aggressorAllies.map((ally) => (
                  <Ally key={`ally-${ally}`} entity={ally} />
                ))}
              </div>
            </div>
          )}
          <p className="p-1 text-xs font-bold text-accent flex justify-start w-full">Defender</p>

          {!defenderDetails && (
            <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
              Nothing to report
            </div>
          )}
          {defenderDetails && (
            <div className="w-full flex gap-4 p-2 bg-white/[.06]">
              <div className="w-60 flex flex-col gap-1 justify-center items-center text-center text-sm">
                <img src={defenderIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="h-12 w-12" />
                <p className={`${!winnerIsAttacker ? "text-success" : "text-error"}`}>
                  {defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(battle.defender)}
                </p>
                <AccountDisplay raw player={defendingPlayer} noColor className="opacity-50" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                {!!defenderDetails.encryptionAtStart &&
                  !!defenderDetails.encryptionAtEnd &&
                  defenderDetails.encryptionAtStart !== defenderDetails.encryptionAtEnd && (
                    <div className="text-xs flex flex-col">
                      {defenderDetails.encryptionAtEnd === 0n && (
                        <p className="opacity-70">Lost control of {entityToRockName(battle.defender)}</p>
                      )}
                      <p className="text-warning">
                        LOST{" "}
                        {formatResourceCount(
                          EntityType.Encryption,
                          defenderDetails.encryptionAtStart - defenderDetails.encryptionAtEnd
                        )}{" "}
                        ENCRYPTION
                      </p>
                    </div>
                  )}
                {Object.entries(defenderDetails.units).length > 0 && <UnitStatus data={defenderDetails.units} />}

                {Object.entries(defenderDetails.resources).length !== 0 && (
                  <ResourceStatus resources={defenderDetails.resources} />
                )}
              </div>
            </div>
          )}

          {battle.targetAllies.length > 0 && (
            <div className="flex w-full items-center gap-2">
              <p className="text-xs font-bold text-accent/70 items-start justify-start">ALLIES</p>
              <div className="grid grid-cols-3 gap-1 w-full">
                {battle.targetAllies.map((ally) => (
                  <Ally key={`ally-${ally}`} entity={ally} />
                ))}
              </div>
            </div>
          )}
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
