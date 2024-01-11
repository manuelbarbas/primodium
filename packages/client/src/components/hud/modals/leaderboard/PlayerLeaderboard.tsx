import { Entity } from "@latticexyz/recs";
import { EAllianceRole } from "contracts/config/enums";
import { FaEnvelope } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { invite } from "src/network/setup/contractCalls/alliance";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const PlayerLeaderboard = () => {
  const { playerAccount } = useMud();
  const data = components.Leaderboard.use();

  if (!data || !playerAccount.address) return null;
  const playerIndex = data.players.indexOf(playerAccount.entity);
  const playerScore = playerIndex == -1 ? undefined : data.scores[playerIndex];

  return (
    <div className="flex flex-col justify-between w-full h-full text-xs pointer-events-auto">
      {/* CAUSED BY INCOMPATIBLE REACT VERSIONS */}
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List height={height - 75} width={width} itemCount={data.players.length} itemSize={47} className="scrollbar">
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
      <div className="w-full">
        <hr className="w-full border-t border-cyan-800 my-2" />

        <SecondaryCard className="w-full overflow-y-auto border border-slate-700 p-2 bg-slate-800">
          <LeaderboardItem player={playerAccount.entity} index={playerIndex} score={playerScore ?? 0} />
        </SecondaryCard>
      </div>
    </div>
  );
};

const LeaderboardItem = ({ player, index, score }: { player: Entity; index: number; score: number }) => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const role = components.PlayerAlliance.use(playerEntity)?.role ?? EAllianceRole.Member;
  const alliance = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  const playerAlliance = components.PlayerAlliance.use(player)?.alliance as Entity | undefined;

  return (
    <SecondaryCard
      className={`grid grid-cols-7 w-full border border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-10 ${
        player === playerEntity ? "border-success" : ""
      }`}
    >
      <div>{index + 1}.</div>
      <div className="col-span-6 flex justify-between items-center">
        <div className="flex gap-1 items-center">
          <AccountDisplay player={player} />
          {player === playerEntity && <p className="text-accent">(You)</p>}
        </div>
        <div className="flex items-center gap-1">
          <p className="font-bold bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          {role <= EAllianceRole.CanInvite && player !== playerEntity && playerAlliance !== alliance && (
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Invite, player)}>
              <Button
                className="btn-xs flex border border-secondary"
                tooltip="Invite"
                tooltipDirection="left"
                onClick={async () => invite(mud, player)}
              >
                <FaEnvelope />
              </Button>
            </TransactionQueueMask>
          )}
        </div>
      </div>
    </SecondaryCard>
  );
};
