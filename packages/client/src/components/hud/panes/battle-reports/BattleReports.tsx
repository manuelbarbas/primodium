import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { FaFistRaised } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { BattleDetails } from "./BattleDetails";

export const LabeledValue: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ children, label }) => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const BattleReports = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const [selectedBattle, setSelectedBattle] = useState<Entity>();

  const battles = components.Battle.useAllPlayerBattles(playerEntity);

  return (
    <Navigator initialScreen={"BattleReports"} className="border-none p-0! h-full">
      <Navigator.Screen title={"BattleReports"} className="full h-full">
        <div className="text-xs space-y-1 w-full h-full overflow-x-hidden flex flex-col items-center">
          {battles.length === 0 && (
            <SecondaryCard className="w-full h-full flex items-center justify-center font-bold">
              <p className="opacity-50">NO BATTLE REPORTS FOUND</p>
            </SecondaryCard>
          )}
          {battles.length !== 0 &&
            battles.map((battle, index) => {
              if (!battle) return null;
              const attackerIsFleet = components.IsFleet.get(battle.attacker);
              const defenderIsFleet = components.IsFleet.get(battle.defender);
              const Battle = () => (
                <div className="grid grid-cols-[10rem_4rem_10rem] place-items-center gap-1 p-1">
                  <div
                    className={`flex flex-col bg-black/10 border border-secondary/50 text-xs justify-center items-center gap-1 p-1 w-full ${
                      battle.winner == battle.attacker ? "ring-2 ring-secondary" : ""
                    }`}
                  >
                    <img
                      src={attackerIsFleet ? "img/icons/outgoingicon.png" : "img/icons/asteroidicon.png"}
                      className="w-4"
                    />
                    {attackerIsFleet ? entityToFleetName(battle.attacker) : entityToRockName(battle.attacker)}
                  </div>
                  <FaFistRaised size={18} className="w-12 rotate-90 -scale-x-100" />
                  <div
                    className={`flex flex-col bg-black/10 border border-secondary/50 text-xs justify-center items-center gap-1 p-1 w-full ${
                      battle.winner == battle.defender ? "ring-2 ring-secondary" : ""
                    }`}
                  >
                    <img
                      src={defenderIsFleet ? "img/icons/outgoingicon.png" : "img/icons/asteroidicon.png"}
                      className="w-4"
                    />
                    {defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(battle.defender)}
                  </div>
                </div>
              );
              return (
                <Navigator.NavButton
                  to="BattleDetails"
                  key={index}
                  onClick={() => setSelectedBattle(battle.entity)}
                  className="w-full p-0 flex justify-between text-xs bg-base-100 relative border-gray-700"
                >
                  {battle.winner !== playerEntity && (
                    <div className="h-full bg-rose-800 gap-1 p-1 mr-2 flex items-center">
                      {/* <Battle /> */}
                      <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-2xl">L</p>
                    </div>
                  )}
                  {battle.winner === playerEntity && (
                    <div className="bg-green-800 gap-1 p-1 flex items-center h-full">
                      {/* <Battle /> */}
                      <p className="bg-green-900 border border-green-500  rounded-md px-1 text-2xl">W</p>
                    </div>
                  )}
                  <Battle />
                  <div className="px-4 flex flex-col gap-1 items-center text-end">
                    <p>{new Date(Number(battle.timestamp * 1000n)).toLocaleDateString()}</p>
                    <p className="opacity-50">
                      [{components.Position.get(battle.rock as Entity)?.x ?? 0},
                      {components.Position.get(battle.rock as Entity)?.y ?? 0}]
                    </p>
                  </div>
                </Navigator.NavButton>
              );
            })}
        </div>
      </Navigator.Screen>
      {selectedBattle && <BattleDetails battleEntity={selectedBattle} />}
    </Navigator>
  );
};
