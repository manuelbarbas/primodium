import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo, useState } from "react";
import { FaTimes, FaTrophy } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
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

  const attackingBattles = components.BattleResult.useAllWith({
    attacker: playerEntity,
  });
  const defendingBattles = components.BattleResult.useAllWith({
    defender: playerEntity,
  });

  const battles = useMemo(() => {
    const battles = [];

    for (const entity of attackingBattles) {
      const battle = components.BattleResult.get(entity);
      if (battle) {
        battles.push({ ...battle, entity });
      }
    }

    for (const entity of defendingBattles) {
      const battle = components.BattleResult.get(entity);
      if (battle) {
        battles.push({ ...battle, entity });
      }
    }

    //sort by block number descending
    battles.sort((a, b) => Number(b.timestamp - a.timestamp));

    return battles;
  }, [attackingBattles, defendingBattles]);

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
            battles.map((battle, index) => (
              <Navigator.NavButton
                to="BattleDetails"
                key={index}
                onClick={() => {
                  setSelectedBattle(battle.entity);
                }}
                className="w-full p-0 flex justify-start text-xs bg-base-100 relative border-gray-700"
              >
                {battle.winner !== playerEntity && (
                  <div className="bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                    <FaTimes size={16} />
                    <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">LOSS</p>
                  </div>
                )}
                {battle.winner === playerEntity && (
                  <div className="bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                    <FaTrophy size={16} />
                    <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">WIN</p>
                  </div>
                )}

                <div className="px-10 flex gap-4">
                  <LabeledValue label="LOCATION">
                    <p>
                      [{components.Position.get(battle.rock as Entity)?.x ?? 0},
                      {components.Position.get(battle.rock as Entity)?.y ?? 0}]
                    </p>
                  </LabeledValue>
                  <LabeledValue label="TYPE">
                    <p>{!battle.totalCargo ? "INVASION" : "RAID"}</p>
                  </LabeledValue>
                  <div className="text-right">
                    <LabeledValue label="TIMESTAMP">
                      <div className="flex gap-1">
                        <p>{new Date(Number(battle.timestamp * 1000n)).toLocaleDateString()}</p>
                      </div>
                    </LabeledValue>
                  </div>
                </div>
              </Navigator.NavButton>
            ))}
        </div>
      </Navigator.Screen>
      <BattleDetails battleEntity={selectedBattle ?? singletonEntity} />
    </Navigator>
  );
};
