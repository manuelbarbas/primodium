import { Entity } from "@latticexyz/recs";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { rankToScore } from "src/util/score";

export const SubLeaderboard = ({ leaderboard, alliance = false }: { leaderboard: Entity; alliance?: boolean }) => {
  const { playerAccount } = useMud();
  const data = components.Leaderboard.get(leaderboard);

  if (!playerAccount.address) return null;
  if (!data)
    return (
      <SecondaryCard className="w-full h-full flex justify-center items-center uppercase font-bold text-sm">
        No Data Found
      </SecondaryCard>
    );
  const entity = alliance
    ? (components.PlayerAlliance.get(playerAccount.entity)?.alliance as Entity)
    : playerAccount.entity;
  const playerIndex = data.players.indexOf(entity);
  const playerScore = playerIndex == -1 ? undefined : data.scores[playerIndex];

  return (
    <SecondaryCard className="flex flex-col w-full h-full text-xs pointer-events-auto">
      <div className={`grid grid-cols-8 w-full p-2 font-bold uppercase`}>
        <div>Rank</div>
        <div className="col-span-4">Player</div>
        <div className="col-span-2">Score</div>
        <div>Pts</div>
      </div>
      <div className="flex flex-col w-full h-full justify-between text-xs pointer-events-auto">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={height - 65}
              width={width}
              itemCount={data.players.length}
              itemSize={60}
              className="scrollbar"
            >
              {({ index, style }) => {
                const player = data.players[index];
                const score = data.scores[index];
                return (
                  <div style={style} className="pr-2">
                    <LeaderboardItem key={index} player={player} index={index} score={score} />
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
        <div className="w-full self-end">
          <hr className="w-full border-t border-cyan-800 my-2" />
          <LeaderboardItem player={playerAccount.entity} index={playerIndex} score={playerScore ?? 0n} />
        </div>
      </div>
    </SecondaryCard>
  );
};

const LeaderboardItem = ({ player, index, score }: { player: Entity; index: number; score: bigint }) => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;

  const rank = index + 1;
  const rankSuffix = rank == 1 ? "st" : rank == 2 ? "nd" : rank == 3 ? "rd" : "th";
  return (
    <SecondaryCard
      className={`grid grid-cols-8 gap-1 w-full border border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-14 ${
        player === playerEntity ? "border-success" : ""
      }`}
    >
      <div>
        {rank}
        {rankSuffix}
      </div>
      <div className="col-span-4 flex gap-1 justify-between items-center">
        <div className="flex items-center gap-1">
          <AccountDisplay player={player} />
          {player === playerEntity && <p className="text-accent">(You)</p>}
        </div>
      </div>
      <p className="font-bold w-fit col-span-2 bg-cyan-700 px-2 flex justify-center">{score.toLocaleString()}</p>
      <div className="flex items-center gap-1 px-1 bg-yellow-700 font-bold">{rankToScore(index + 1)}pts</div>
    </SecondaryCard>
  );
};
