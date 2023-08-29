import { EntityID } from "@latticexyz/recs";
import { FaTimes, FaTrophy } from "react-icons/fa";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { Battle } from "src/network/components/clientComponents";
import {
  getBlockTypeName,
  shortenAddress,
  toRomanNumeral,
} from "src/util/common";
import { BackgroundImage, ResourceImage } from "src/util/constants";

export const UnitStatus: React.FC<{
  unit: EntityID;
  unitsLeft: number;
  count: number;
  level: number;
}> = ({ unit, unitsLeft, count, level }) => {
  return (
    <div className={`w-full border-b border-b-slate-700 text-xs bg-slate-800`}>
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center justify-center">
          <img
            key={`unit-${unit}`}
            src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
            className={`border border-cyan-400 w-6 h-6 rounded-xs`}
          />
          <p className="rounded-md bg-cyan-700 text-xs p-1">x{unitsLeft}</p>
          {getBlockTypeName(unit)} {toRomanNumeral(level)}
        </div>
        <div className="relative flex gap-1 p-1 px-2 bg-slate-900 rounded-md items-center">
          <p
            className={`font-bold ${
              unitsLeft - count < 0 ? "text-rose-500" : "text-green-500"
            }`}
          >
            {Math.abs(Math.min(unitsLeft - count, 0))}
          </p>{" "}
          LOST
        </div>
      </div>
    </div>
  );
};

export const BattleDetails: React.FC<{
  player: EntityID;
  battle: ReturnType<typeof Battle.format>;
}> = ({ battle, player }) => {
  const playersUnits =
    player === battle.attacker ? battle.attackerUnits : battle.defenderUnits;
  const enemyUnits =
    player === battle.attacker ? battle.defenderUnits : battle.attackerUnits;

  return (
    <div className="relative flex flex-col items-center text-white w-full">
      <div className="relative bg-slate-800 pixel-images border border-cyan-400 p-3 w-full rounded-md">
        <div className="flex flex-col items-center space-y-3">
          {player === battle.winner && (
            <div className="bg-green-600 p-1 px-4 rounded-md flex flex-col items-center border border-green-400">
              <FaTrophy size={24} />
              <p className="font-bold text-2xl">WON</p>
            </div>
          )}
          {player !== battle.winner && (
            <div className="bg-rose-600 p-1 px-4 rounded-md flex flex-col items-center border border-rose-400">
              <FaTimes size={24} />
              <p className="font-bold text-2xl">LOST</p>
            </div>
          )}
          <hr className="border-t border-cyan-600/40 w-full" />

          <div className="flex gap-2 text-sm items-center justify-center">
            <div className="bg-slate-700 p-2 rounded-md border border-rose-500 w-32">
              <p className="font-bold text-xs text-cyan-400">ATTACKER</p>
              {battle.attacker === player
                ? "You"
                : shortenAddress(battle.attacker)}
            </div>
            vs
            <div className="bg-slate-700 p-2 rounded-md border border-green-600 w-32">
              <p className="font-bold text-xs text-cyan-400">DEFENDER</p>
              {battle.defender === player
                ? "You"
                : shortenAddress(battle.defender)}
            </div>
          </div>

          <hr className="border-t border-cyan-600/40 w-full" />

          {battle.resources && (
            <div className="flex flex-col justify-center items-center gap-2 bg-slate-900 p-2 px-5 rounded-md border border-slate-700">
              <p className="text-lg font-bold leading-none">
                {player === battle.winner ? "REWARDS" : "RAIDED"}
              </p>
              <div className="flex items-center ">
                {battle.resources.map((resource, i) => (
                  <ResourceIconTooltip
                    key={`resource-${i}`}
                    image={ResourceImage.get(resource)!}
                    resourceId={resource}
                    name={getBlockTypeName(resource)}
                    amount={Number(battle.raidedAmount?.at(i) ?? 0)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="w-full">
            <p className="p-1 text-xs font-bold text-cyan-400">
              YOUR FLEET STATUS
            </p>
            <div className="w-full rounded-md overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col items-center justify-center scrollbar">
              {playersUnits.length === 0 && (
                <p className="text-sm font-bold text-slate-400 text-center">
                  NO FLEET FOUND
                </p>
              )}
              {playersUnits.length !== 0 && (
                <div className="w-full h-full">
                  {playersUnits.map(({ type, unitsLeft, count, level }, i) => (
                    <UnitStatus
                      unit={type}
                      unitsLeft={unitsLeft}
                      count={count}
                      level={level}
                      key={`unit-${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <p className="p-1 text-xs font-bold text-cyan-400">
              ENEMY FLEET STATUS
            </p>
            <div className="w-full rounded-md overflow-hidden h-32 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col items-center justify-center scrollbar">
              {enemyUnits.length === 0 && (
                <p className="text-sm font-bold text-slate-400 text-center">
                  NO FLEET FOUND
                </p>
              )}
              {enemyUnits.length !== 0 && (
                <div className="w-full h-full">
                  {enemyUnits.map(({ type, unitsLeft, count, level }, i) => (
                    <UnitStatus
                      unit={type}
                      unitsLeft={unitsLeft}
                      count={count}
                      level={level}
                      key={`unit-${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 flex gap-1 text-xs p-2">
          <p className="opacity-30">BLOCK</p>
          <p className="opacity-50 font-bold">{battle.blockNumber}</p>
        </div>
        <div className="absolute top-0 left-0 flex gap-1 text-xs p-2">
          <p className="opacity-50 font-bold">
            {battle.raidedAmount ? "RAID" : "INVASION"}
          </p>
        </div>
      </div>
    </div>
  );
};
