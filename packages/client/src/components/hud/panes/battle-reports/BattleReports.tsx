import { EntityID, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { FaTimes, FaTrophy } from "react-icons/fa";
import { Account, Battle } from "src/network/components/clientComponents";
import { SingletonID } from "@latticexyz/network";
import { useMemo, useState } from "react";
import { world } from "src/network/world";
import {
  BattleRaidResult,
  Position,
} from "src/network/components/chainComponents";
import { BattleDetails } from "./BattleDetails";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

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
  const [selectedBattle, setSelectedBattle] = useState<EntityID>();

  const player = Account.use()?.value;
  const attackingBattles = useEntityQuery([
    HasValue(Battle, {
      attacker: player ?? SingletonID,
    }),
  ]);

  const defendingBattles = useEntityQuery([
    HasValue(Battle, {
      defender: player ?? SingletonID,
    }),
  ]);

  const battles = useMemo(() => {
    const battles = [];

    for (const entityIndex of attackingBattles) {
      const entity = world.entities[entityIndex];
      const battle = Battle.get(entity);
      if (battle) {
        battles.push({ ...battle, entity });
      }
    }

    for (const entityIndex of defendingBattles) {
      const entity = world.entities[entityIndex];
      const battle = Battle.get(entity);
      if (battle) {
        battles.push({ ...battle, entity });
      }
    }

    //sort by block number descending
    battles.sort((a, b) => b.blockNumber - a.blockNumber);

    return battles;
  }, [attackingBattles, defendingBattles]);

  if (!player) return null;

  return (
    <Navigator
      initialScreen={"BattleReports"}
      className="border-none p-0! h-full"
    >
      <Navigator.Screen title={"BattleReports"} className="w-full h-full">
        <div className="text-xs space-y-1 w-full h-full overflow-x-hidden">
          {battles.length === 0 && (
            <SecondaryCard className="w-full h-full flex items-center justify-center font-bold">
              <p className="opacity-50">NO BATTLE REPORTS FOUND</p>
            </SecondaryCard>
          )}
          {battles.length !== 0 &&
            battles.map((battle, index) => (
              <Navigator.NavButton
                to="BattleDetails"
                key={index}
                onClick={() => {
                  setSelectedBattle(battle.id);
                }}
                className="w-full p-0 flex justify-between text-xs bg-base-100 relative border-gray-700"
              >
                <div className="flex gap-1 items-center">
                  {battle.winner !== player && (
                    <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                      <FaTimes size={16} />
                      <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
                        LOSS
                      </p>
                    </div>
                  )}
                  {battle.winner === player && (
                    <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                      <FaTrophy size={16} />
                      <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
                        WIN
                      </p>
                    </div>
                  )}

                  <LabeledValue label="LOCATION">
                    <p>
                      [{Position.get(battle.spaceRock)?.x ?? 0},
                      {Position.get(battle.spaceRock)?.y ?? 0}]
                    </p>
                  </LabeledValue>
                </div>
                <LabeledValue label="TYPE">
                  <p>
                    {!BattleRaidResult.get(battle?.id ?? SingletonID)
                      ? "INVASION"
                      : "RAID"}
                  </p>
                </LabeledValue>
                <div className="text-right">
                  <LabeledValue label="TIMESTAMP">
                    <div className="flex gap-1">
                      <span className="opacity-50">BLOCK</span>
                      <p>{Number(battle.blockNumber)}</p>
                    </div>
                  </LabeledValue>
                </div>
              </Navigator.NavButton>
            ))}
        </div>
      </Navigator.Screen>
      <BattleDetails battleId={selectedBattle ?? SingletonID} player={player} />
    </Navigator>
  );
};
