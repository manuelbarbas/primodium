import { Entity } from "@latticexyz/recs";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { rankToScore } from "src/util/score";

export const GrandLeaderboard = ({ leaderboard }: { leaderboard: Entity }) => {
  const { playerAccount } = useMud();
  const data = components.GrandLeaderboard.use(leaderboard);

  if (!data || !playerAccount.address) return null;
  //   const playerIndex = data.players.indexOf(playerAccount.entity);
  //   const playerScore = playerIndex == -1 ? undefined : data.scores[playerIndex];

  return (
    <SecondaryCard className="flex flex-col w-full h-full text-xs pointer-events-auto">
      <div className={`grid grid-cols-8 w-full p-2 font-bold uppercase`}>
        <div>Rank</div>
        <div className="col-span-4">Player</div>
        <div>Extraction</div>
        <div>Conquest</div>
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
                const extractionRank = data.extractionRanks[index];
                const conquestRank = data.conquestRanks[index];
                return (
                  <div style={style} className="pr-2">
                    <GrandLeaderboardItem
                      key={index}
                      player={player}
                      index={index}
                      score={score}
                      extractionRank={extractionRank}
                      conquestRank={conquestRank}
                    />
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </SecondaryCard>
  );
};

const GrandLeaderboardItem = ({
  player,
  index,
  score,
  extractionRank,
  conquestRank,
}: {
  player: Entity;
  index: number;
  score: number;
  extractionRank: number;
  conquestRank: number;
}) => {
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
      <p className="font-bold w-fit bg-cyan-700 px-2">
        {extractionRank.toLocaleString()}st[{rankToScore(extractionRank)}]
      </p>
      <p className="font-bold w-fit bg-cyan-700 px-2">
        {conquestRank.toLocaleString()}st[{rankToScore(conquestRank)}]
      </p>
      <p className="font-bold w-fit bg-yellow-700 px-2 flex justify-end">{score.toLocaleString()}</p>
    </SecondaryCard>
  );
};
