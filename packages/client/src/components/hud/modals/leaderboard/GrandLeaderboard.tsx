import { Entity } from "@latticexyz/recs";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { rankToScore } from "src/util/score";

export const GrandLeaderboard = ({ leaderboard, alliance = false }: { leaderboard: Entity; alliance?: boolean }) => {
  const { playerAccount } = useMud();
  const data = components.GrandLeaderboard.use(leaderboard);

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
  const playerScore = playerIndex == -1 ? 0 : data.scores[playerIndex];
  const playerExtractionRank = playerIndex == -1 ? 0 : data.extractionRanks[playerIndex];
  const playerConquestRank = playerIndex == -1 ? 0 : data.conquestRanks[playerIndex];

  return (
    <SecondaryCard className="flex flex-col w-full h-full text-xs pointer-events-auto">
      <div className={`grid grid-cols-8 w-full p-2 font-bold uppercase`}>
        <div>Rank</div>
        <div className="col-span-4">Name</div>
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
                      alliance={alliance}
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
      {entity && (
        <div className="w-full self-end">
          <hr className="w-full border-t border-cyan-800 my-2" />
          <GrandLeaderboardItem
            player={entity}
            index={playerIndex}
            score={playerScore ?? 0}
            alliance={alliance}
            extractionRank={playerExtractionRank}
            conquestRank={playerConquestRank}
          />
        </div>
      )}
    </SecondaryCard>
  );
};

const rankSuffix = (rank: number) => (rank == 1 ? "st" : rank == 2 ? "nd" : rank == 3 ? "rd" : "th");

export const GrandLeaderboardItem = ({
  player,
  index,
  score,
  extractionRank,
  conquestRank,
  alliance = false,
  className = "",
}: {
  player: Entity;
  index: number;
  score: number;
  extractionRank: number;
  conquestRank: number;
  alliance?: boolean;
  className?: string;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const entity = alliance ? (components.PlayerAlliance.get(playerEntity)?.alliance as Entity) : playerEntity;

  const rank = index + 1;
  return (
    <SecondaryCard
      className={`grid grid-cols-8 gap-1 w-full border border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-14 ${
        player === entity ? "border-success" : ""
      } ${className}`}
    >
      <div>
        {rank}
        {rankSuffix(rank)}
      </div>
      <div className="col-span-4 flex gap-1 justify-between items-center">
        <div className="flex items-center gap-1">
          {alliance ? `[${getAllianceName(player, true)}]` : <AccountDisplay player={player} />}
          {player === entity && <p className="text-accent">(You)</p>}
        </div>
      </div>
      <div className="font-bold w-fit bg-cyan-700 px-2">
        {rankToScore(extractionRank)}
        <p className="inline opacity-70">[{extractionRank.toLocaleString() + rankSuffix(extractionRank)}]</p>
      </div>
      <div className="font-bold w-fit bg-cyan-700 px-2">
        {rankToScore(conquestRank)}
        <p className="inline opacity-70">[{conquestRank.toLocaleString() + rankSuffix(conquestRank)}]</p>
      </div>
      <p className="font-bold w-fit bg-yellow-700 px-2 flex justify-end">{score.toLocaleString()}</p>
    </SecondaryCard>
  );
};
