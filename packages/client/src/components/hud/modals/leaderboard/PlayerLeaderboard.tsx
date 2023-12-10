import { Entity } from "@latticexyz/recs";
import { FixedSizeList as List } from "react-window";

import { EAllianceRole } from "contracts/config/enums";
import { FaEnvelope } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { invite } from "src/util/web3/contractCalls/alliance";

export const PlayerLeaderboard = () => {
  const network = useMud().network;
  const address = network.address;
  const data = components.Leaderboard.use();

  if (!data || !address) return null;
  const playerIndex = data.players.indexOf(network.playerEntity);
  const playerScore = playerIndex == -1 ? undefined : data.scores[playerIndex];

  return (
    <div className="flex flex-col items-center justify-between w-full h-full text-xs pointer-events-auto">
      <List height={285} width="100%" itemCount={data.players.length} itemSize={47} className="scrollbar h-full">
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
      <div className="w-full">
        <hr className="w-full border-t border-cyan-800 my-2" />

        <SecondaryCard className="w-full overflow-y-auto border border-slate-700 p-2 bg-slate-800">
          {playerScore && <LeaderboardItem player={network.playerEntity} index={playerIndex} score={playerScore} />}
        </SecondaryCard>
      </div>
    </div>
  );
};

const LeaderboardItem = ({ player, index, score }: { player: Entity; index: number; score: number }) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
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
                onClick={async () => {
                  invite(player, network);
                }}
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
