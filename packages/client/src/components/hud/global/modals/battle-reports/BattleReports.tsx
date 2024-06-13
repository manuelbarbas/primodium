import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Loader } from "src/components/core/Loader";
import { Navigator } from "src/components/core/Navigator";
import { BattleDetails } from "./BattleDetails";
import { useAccountClient, useCore, useSyncStatus } from "@primodiumxyz/core/react";
import { entityToFleetName, entityToRockName, formatTimeAgo, hashEntities, Keys } from "@primodiumxyz/core";

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
  const { tables, sync } = useCore();
  const {
    playerAccount: { entity: playerEntity },
  } = useAccountClient();
  const [selectedBattle, setSelectedBattle] = useState<Entity>();
  const { loading, error } = useSyncStatus(hashEntities(Keys.BATTLE, playerEntity));

  const battles = tables.Battle.useAllPlayerBattles(playerEntity).sort((a, b) =>
    Number(tables.Battle.get(b)?.timestamp! - tables.Battle.get(a)?.timestamp!)
  );

  useEffect(() => {
    sync.syncBattleReports(playerEntity);
  }, [playerEntity]);

  const initialScreen = useMemo(() => {
    if (error) return "error";

    if (loading) return "loading";

    return "BattleReports";
  }, [loading, error]);

  return (
    <Navigator initialScreen={initialScreen} className="border-none p-0! h-full overflow-y-auto hide-scrollbar">
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

export const BattleButton = ({
  battleEntity,
  setSelectedBattle,
}: {
  battleEntity: Entity;
  setSelectedBattle: (entity: Entity) => void;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useAccountClient();
  const { tables } = useCore();

  const battle = tables.Battle.use(battleEntity);

  const attackingPlayer = battle?.attackingPlayer as Entity;
  const defendingPlayer = battle?.defendingPlayer as Entity;

  const playerIsAttacker = attackingPlayer === playerEntity;
  const playerIsWinner = (battle?.winner as Entity) === battle?.attacker ? playerIsAttacker : !playerIsAttacker;
  const attackerIsFleet = tables.IsFleet.use(battle?.attacker);
  const defenderIsFleet = tables.IsFleet.use(battle?.defender);

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
            <img src={attackerIsFleet ? InterfaceIcons.Fleet : InterfaceIcons.Asteroid} className="h-8" />
            <div className={`flex flex-col h-full text-left ${playerIsAttacker ? "text-success" : "text-error"}`}>
              <p>{attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}</p>
              <AccountDisplay raw player={attackingPlayer} noColor className="opacity-50" />
            </div>
          </div>

          <p className="grid place-items-center uppercase font-bold">vs</p>
          <div className={`flex bg-glass text-xs text-left justify-center items-center gap-2 p-1 w-full`}>
            <img src={defenderIsFleet ? InterfaceIcons.Fleet : InterfaceIcons.Asteroid} className="h-8" />
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
