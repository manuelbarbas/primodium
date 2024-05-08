import { SecondaryCard } from "@/components/core/Card";
import { BattleAllies } from "@/components/hud/global/modals/battle-reports/BattleAllies";
import { ResourceStatus } from "@/components/hud/global/modals/battle-reports/ResourceStatus";
import { UnitStatus } from "@/components/hud/global/modals/battle-reports/UnitStatus";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { EntityType } from "@/util/constants";
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

export const BattleDetails: React.FC<{
  battleEntity: Entity;
}> = ({ battleEntity }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const battle = components.Battle.use(battleEntity);

  const attackingPlayer = battle?.attackingPlayer as Entity;
  const defendingPlayer = battle?.defendingPlayer as Entity;
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

  const attackerAllyDetails = battle.aggressorAllies.map((ally) =>
    Object.values(battle.participants).find((p) => p.entity === ally)
  );
  const defenderAllyDetails = battle.targetAllies.map((ally) =>
    Object.values(battle.participants).find((p) => p.entity === ally)
  );

  return (
    <Navigator.Screen
      title="BattleDetails"
      className="relative gap-3 flex flex-col items-center text-white h-full w-full p-1 mb-1 "
    >
      <SecondaryCard className="relative pixel-images p-3 w-full h-full overflow-y-auto scrollbar">
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

          <SecondaryCard className="w-full flex flex-col gap-2 p-2">
            <div className="w-full flex gap-4">
              <div className="w-60 flex flex-col gap-1 justify-center items-center text-center text-sm">
                <img src={attackerIsFleet ? InterfaceIcons.Fleet : InterfaceIcons.Asteroid} className="h-12 w-12" />
                <p className={`${winnerIsAttacker ? "text-success" : "text-error"}`}>
                  {attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}
                </p>
                <AccountDisplay raw player={attackingPlayer} noColor className="opacity-50" />
              </div>
              {!attackerDetails && (
                <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
                  Nothing to report
                </div>
              )}
              {attackerDetails && (
                <div className="flex flex-col gap-2 w-2/3">
                  {defenderDetails?.encryptionAtEnd === 0n && (
                    <p className="opacity-70 text-xs">Gained control of {entityToRockName(battle.defender)}</p>
                  )}
                  {Object.entries(attackerDetails.units).length > 0 && <UnitStatus data={attackerDetails.units} />}

                  {Object.entries(attackerDetails.resources).length !== 0 && (
                    <ResourceStatus resources={attackerDetails.resources} />
                  )}
                </div>
              )}
            </div>

            <BattleAllies allies={attackerAllyDetails} />
          </SecondaryCard>
          <p className="p-1 text-xs font-bold text-accent flex justify-start w-full">Defender</p>

          {!defenderDetails && (
            <div className="w-full bg-base-100 h-32 border border-slate-500 pulse text-secondary uppercase text-sm flex justify-center items-center">
              Nothing to report
            </div>
          )}
          {defenderDetails && (
            <SecondaryCard className="w-full flex flex-row gap-4 p-2 ">
              <div className="w-60 flex flex-col gap-1 justify-center items-center text-center text-sm">
                <img src={defenderIsFleet ? InterfaceIcons.Fleet : InterfaceIcons.Asteroid} className="h-12 w-12" />
                <p className={`${!winnerIsAttacker ? "text-success" : "text-error"}`}>
                  {defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(battle.defender)}
                </p>
                <AccountDisplay raw player={defendingPlayer} noColor className="opacity-50" />
              </div>
              <div className="flex flex-col gap-2 w-2/3">
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
            </SecondaryCard>
          )}

          <BattleAllies allies={defenderAllyDetails} />
        </div>
      </SecondaryCard>
      <Navigator.BackButton className="btn btn-primary btn-xs" />
    </Navigator.Screen>
  );
};
