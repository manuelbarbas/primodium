import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode } from "contracts/config/enums";
import { FaLock, FaUserPlus } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { joinAlliance, requestToJoin } from "src/network/setup/contractCalls/alliance";
import { getAllianceName } from "src/util/alliance";
import { entityToColor } from "src/util/color";
import { EntityType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { InfoRow } from "./InfoRow";

export const IndexScreen = () => {
  const data = components.GrandLeaderboard.use(EntityType.AllianceGrandLeaderboard);

  return (
    <Navigator.Screen
      title="score"
      className="flex flex-col !items-start justify-between w-full h-full text-xs pointer-events-auto"
    >
      {data && (
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={height - 50}
              width={width}
              itemCount={data.players.length}
              itemSize={47}
              className="scrollbar"
            >
              {({ index, style }) => {
                const alliance = data.players[index];
                const score = data.scores[index];
                return (
                  <div style={style} className="pr-2">
                    <LeaderboardItem key={index} index={index} score={Number(score)} entity={alliance} />
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      )}
      {!data && (
        <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
          NO ALLIANCES
        </SecondaryCard>
      )}
      <div className="w-full">
        <hr className="w-full border-t border-cyan-800 my-2" />
        <InfoRow data={data} />
      </div>
    </Navigator.Screen>
  );
};

const LeaderboardItem = ({
  index,
  score,
  entity,
  className,
}: {
  index: number;
  score: number;
  entity: Entity;
  className?: string;
}) => {
  const mud = useMud();
  const { playerAccount } = mud;
  const allianceMode = components.Alliance.get(entity)?.inviteMode as EAllianceInviteMode | undefined;
  const playerAlliance = components.PlayerAlliance.get(playerAccount.entity)?.alliance as Entity;
  const inviteOnly = allianceMode === EAllianceInviteMode.Closed;

  return (
    <SecondaryCard
      className={`grid grid-cols-7 w-full border border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-10 ${
        playerAlliance === entity ? "border-success" : ""
      } ${className}`}
    >
      <div>{index + 1}.</div>
      <div className="col-span-6 flex justify-between items-center">
        <div className="flex gap-1 items-center">
          <FaLock className="text-warning opacity-75" />
          <p className="font-bold" style={{ color: entityToColor(entity) }}>
            [{getAllianceName(entity, true)}]
          </p>
        </div>
        <div className="flex items-center gap-1">
          <p className="font-bold bg-cyan-700 px-2 ">{score}</p>
          {!playerAlliance && (
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.JoinAlliance, entity)}>
              <Button
                tooltip={inviteOnly ? "Request to Join" : "Join"}
                tooltipDirection="left"
                className={`btn-xs flex border ${inviteOnly ? "border-warning" : "border-secondary"}`}
                onClick={() => {
                  inviteOnly ? requestToJoin(mud, entity) : joinAlliance(mud, entity);
                }}
              >
                <FaUserPlus />
              </Button>
            </TransactionQueueMask>
          )}
        </div>
      </div>
    </SecondaryCard>
  );
};
