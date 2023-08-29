import { HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { FaArrowLeft, FaGreaterThan, FaTimes, FaTrophy } from "react-icons/fa";
import { Account, Battle } from "src/network/components/clientComponents";
import { SingletonID } from "@latticexyz/network";
import { useMemo, useState } from "react";
import { world } from "src/network/world";
import { Position } from "src/network/components/chainComponents";
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
  const [selectedBattle, setSelectedBattle] =
    useState<ReturnType<typeof Battle.format>>();

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
      const battle = Battle.get(world.entities[entityIndex]);
      if (battle) {
        battles.push(battle);
      }
    }

    for (const entityIndex of defendingBattles) {
      const battle = Battle.get(world.entities[entityIndex]);
      if (battle) {
        battles.push(battle);
      }
    }

    //sort by block number descending
    battles.sort((a, b) => b.blockNumber - a.blockNumber);

    return battles;
  }, [attackingBattles, defendingBattles]);

  if (!player) return null;

  return (
    <div className="flex flex-col items-center gap-2 text-white w-[30rem] min-w-full">
      {!selectedBattle && (
        <div className="w-full text-xs space-y-3 h-96 scrollbar p-2 rounded-md ">
          {battles.length === 0 && (
            <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
              <p className="opacity-50">NO BATTLE REPORTS FOUND</p>
            </div>
          )}
          {battles.length !== 0 &&
            battles.map((battle, index) => (
              <button
                key={index}
                onClick={() => setSelectedBattle(Battle.format(battle))}
                className="relative flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 hover:border-cyan-400 outline-none"
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
                  <p>{!battle.raidedAmount ? "INVASION" : "RAID"}</p>
                </LabeledValue>
                <div className="text-right">
                  <LabeledValue label="TIMESTAMP">
                    <div className="flex gap-1">
                      <span className="opacity-50">BLOCK</span>
                      <p>{battle.blockNumber}</p>
                    </div>
                  </LabeledValue>
                </div>

                <div className="flex items-center gap-1 px-1 absolute bottom-0 right-1 text-[.6rem] border rounded-md border-cyan-800 bg-slate-700 translate-y-1/2">
                  VIEW DETAILS <FaGreaterThan />
                </div>
              </button>
            ))}
        </div>
      )}
      {selectedBattle && (
        <BattleDetails battle={selectedBattle} player={player} />
      )}
      {selectedBattle && (
        <button
          className="p-1 px-4 border rounded-md gap-2 flex items-center text-md font-bold bg-slate-800 border-slate-600 mt-2"
          onClick={() => setSelectedBattle(undefined)}
        >
          <FaArrowLeft /> Back
        </button>
      )}
    </div>
  );
};
