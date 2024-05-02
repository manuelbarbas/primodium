import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { formatTimeAgo } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Loader } from "src/components/core/Loader";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { hydrateBattleReports } from "src/network/sync/indexer";
import { Keys } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { BattleDetails } from "./BattleDetails";

export const LoadingScreen = () => {
  return (
    <Navigator.Screen
      title="loading"
      className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto"
    >
      <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
        <Loader />
        LOADING BATTLE REPORTS
      </SecondaryCard>
    </Navigator.Screen>
  );
};

export const ErrorScreen = () => {
  return (
    <Navigator.Screen
      title="error"
      className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto"
    >
      <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50 text-error">
        <FaTimes />
        ERROR SYNCING BATTLE REPORTS
      </SecondaryCard>
    </Navigator.Screen>
  );
};

export const BattleReports = () => {
  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const [selectedBattle, setSelectedBattle] = useState<Entity>();
  const { loading, error } = useSyncStatus(hashEntities(Keys.BATTLE, playerEntity));

  const battles = components.Battle.useAllPlayerBattles(playerEntity).sort((a, b) =>
    Number(components.Battle.get(b)?.timestamp! - components.Battle.get(a)?.timestamp!)
  );

  useEffect(() => {
    hydrateBattleReports(playerEntity, mud);
  }, [playerEntity, mud]);

  const initialScreen = useMemo(() => {
    if (error) return "error";

    if (loading) return "loading";

    return "BattleReports";
  }, [loading, error]);

  return (
    <Navigator initialScreen={initialScreen} className="border-none p-0! h-full">
      <LoadingScreen />
      <ErrorScreen />
      <Navigator.Screen title={"BattleReports"} className="full h-full">
        <div className="text-xs gap-3 w-full h-full flex flex-col items-center">
          {battles.length === 0 && (
            <SecondaryCard className="w-full h-full flex items-center justify-center font-bold">
              <p className="opacity-50">NO BATTLE REPORTS</p>
            </SecondaryCard>
          )}
          {battles.length !== 0 &&
            battles.map((battle, i) => (
              <BattleButton battleEntity={battle} key={`battle-${i}`} setSelectedBattle={setSelectedBattle} />
            ))}
        </div>
      </Navigator.Screen>
      {selectedBattle && <BattleDetails battleEntity={selectedBattle} />}
    </Navigator>
  );
};

const BattleButton = ({
  battleEntity,
  setSelectedBattle,
}: {
  battleEntity: Entity;
  setSelectedBattle: (entity: Entity) => void;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const battle = components.Battle.use(battleEntity);

  const attackingPlayer = battle?.attackingPlayer as Entity;
  const defendingPlayer = battle?.defendingPlayer as Entity;

  const playerIsAttacker = attackingPlayer === playerEntity;
  const playerIsWinner = (battle?.winner as Entity) === battle?.attacker ? playerIsAttacker : !playerIsAttacker;
  const attackerIsFleet = components.IsFleet.use(battle?.attacker);
  const defenderIsFleet = components.IsFleet.use(battle?.defender);

  if (!battle) return <></>;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="opacity-50">
        Battle at <span className="text-accent">{entityToRockName(battle?.rock)}</span>
      </div>
      <Navigator.NavButton
        size="content"
        variant="ghost"
        to="BattleDetails"
        onClick={() => setSelectedBattle(battleEntity)}
        className={`w-full grid grid-cols-6 text-xs relative ${playerIsWinner ? "bg-success/20" : "bg-error/20"}`}
      >
        <div className="col-span-5 grid grid-cols-[10fr_2fr_10fr] place-items-center gap-1">
          <div className={`flex bg-glass text-xs justify-center items-center gap-2 p-1 w-full`}>
            <img src={attackerIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="h-8" />
            <div className={`flex flex-col h-full text-left ${playerIsAttacker ? "text-success" : "text-error"}`}>
              <p>{attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}</p>
              <AccountDisplay raw player={attackingPlayer} noColor className="opacity-50" />
            </div>
          </div>

          <p className="grid place-items-center uppercase font-bold">vs</p>
          <div className={`flex bg-glass text-xs text-left justify-center items-center gap-2 p-1 w-full`}>
            <img src={defenderIsFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid} className="h-8" />
            <div className={`flex flex-col h-full ${!playerIsAttacker ? "text-success" : "text-error"}`}>
              <p>{defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(battle.defender)}</p>
              <AccountDisplay raw player={defendingPlayer} noColor className="opacity-50" />
            </div>
          </div>
        </div>
        <div className="pr-4 flex flex-col gap-1 justify-end text-right">
          <p className="text-right">{formatTimeAgo(battle?.timestamp!)}</p>
          <p className="opacity-50"> {new Date(Number(battle.timestamp * 1000n)).toLocaleDateString()}</p>
        </div>
      </Navigator.NavButton>
    </div>
  );
};
