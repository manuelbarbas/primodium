import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { TextInput } from "@/components/core/TextInput";
import { ALLIANCE_TAG_SIZE } from "@/components/hud/modals/alliance-mgmt/CreateScreen";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { joinAlliance, requestToJoin } from "@/network/setup/contractCalls/alliance";
import { getAllianceName } from "@/util/alliance";
import { cn } from "@/util/client";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { FaCheck, FaEnvelope, FaLock, FaPlus, FaSearch } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

// This screen is the home interface for searching alliances, and accessing both the "create" and "invites" screens
// It is only accessible to players who are not in an alliance
export const IndexScreen = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const allianceEntities = components.Alliance.useAll() as Entity[] | undefined;
  const allianceNames = allianceEntities?.map((entity) => getAllianceName(entity, true));
  const [searchTag, setSearchTag] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const joinRequests = components.AllianceRequest.useAllWith({ player: playerEntity }) ?? [];

  const alliances = useMemo(() => {
    const allAlliances = allianceEntities?.map((entity, i) => ({
      entity,
      name: allianceNames![i],
      // All players in the alliance
      members: components.PlayerAlliance.getAllWith({ alliance: entity }),
      // Whether the player has been invited or requested to join this alliance
      invited: invites.some((invite: Entity) => invite.includes(entity.slice(0, 2))),
      requested: joinRequests.some((request: Entity) => request.includes(entity.slice(0, 2))),
    }));
    if (!searchTag) return allAlliances;
    // TODO: better search algorithm
    return allAlliances?.filter((alliance) => alliance.name.toLowerCase().includes(searchTag.toLowerCase()));
  }, [searchTag, allianceEntities, allianceNames, invites, joinRequests]);

  // Check if the player is not already in an alliance (for disabling buttons & custom display)
  // const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance;
  const playerAlliance = alliances?.find((alliance) =>
    alliance.members.some((member) => member === playerEntity)
  )?.entity;

  const allianceLength = alliances?.length ?? 0;
  return (
    <Navigator.Screen
      title="search"
      className="relative grid grid-rows-[min-content_1fr_min-content] w-full h-full text-xs pointer-events-auto p-4 gap-4"
    >
      {allianceLength > 0 && (
        <div className="absolute top-2 right-2 text-xs opacity-70">{allianceLength} Alliances</div>
      )}
      <div className="flex flex-col items-center gap-2 text-base">
        <p>ALLIANCES</p>
        <div className="relative w-fit">
          <TextInput
            placeholder="SEARCH ALLIANCE"
            maxLength={ALLIANCE_TAG_SIZE}
            onChange={(e) => setSearchTag(e.target.value)}
            className="uppercase h-8 text-sm pl-12"
          />
          <FaSearch className="absolute left-4 top-2 opacity-75" />
        </div>
      </div>
      {alliances && alliances.length > 0 ? (
        <div className="flex flex-col w-full h-full justify-between text-xs pointer-events-auto">
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={10} itemSize={52} className="scrollbar">
                {({ index, style }) => (
                  <div style={style} className="pr-2">
                    <AllianceItem
                      key={alliances[index].entity}
                      {...alliances[index]}
                      alreadyMember={alliances[index].entity === playerAlliance}
                    />
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      ) : (
        <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
          NO ALLIANCES
        </SecondaryCard>
      )}
      <div className={cn("relative flex gap-8", playerAlliance ? "justify-end" : "justify-center")}>
        <Navigator.NavButton
          to="create"
          variant="primary"
          className="btn-sm border-2 border-secondary flex gap-2"
          disabled={!!playerAlliance}
        >
          <FaPlus />
          CREATE
        </Navigator.NavButton>
        <Navigator.NavButton
          to="invites"
          variant={playerAlliance ? "neutral" : "primary"}
          className={cn("btn-sm", !playerAlliance && "border-2 border-secondary")}
        >
          INVITES ({invites.length})
        </Navigator.NavButton>
        {playerAlliance && (
          <Navigator.NavButton
            to="manage"
            variant="primary"
            className="btn-sm absolute left-0 border-2 border-secondary"
          >
            YOUR ALLIANCE
          </Navigator.NavButton>
        )}
      </div>
    </Navigator.Screen>
  );
};

const AllianceItem = ({
  entity,
  name,
  members,
  invited,
  requested,
  className,
  alreadyMember,
}: {
  entity: Entity;
  name: string;
  members: Entity[];
  invited: boolean;
  requested: boolean;
  className?: string;
  alreadyMember?: boolean;
}) => {
  const mud = useMud();
  const allianceMode = components.Alliance.get(entity)?.inviteMode as EAllianceInviteMode | undefined;
  const inviteOnly = allianceMode === EAllianceInviteMode.Closed;

  return (
    <SecondaryCard className={cn("grid grid-cols-[1fr_min-content] w-full px-4 items-center h-[48px]", className)}>
      <div className="col-span-6 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-warning">[{name}]</span>
          <span className="text-xs opacity-75">({members.length})</span>
          {inviteOnly && <FaLock />}
        </div>
        <div className="flex items-center gap-1">
          {alreadyMember ? (
            <span className="text-xs text-success">YOUR ALLIANCE</span>
          ) : (
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.JoinAlliance, entity)}>
              <Button
                className="btn-xs"
                onClick={() => {
                  inviteOnly && !invited ? requestToJoin(mud, entity) : joinAlliance(mud, entity);
                }}
                disabled={requested}
              >
                {requested ? (
                  <>
                    <FaCheck /> SENT
                  </>
                ) : !inviteOnly || invited ? (
                  <>
                    <FaPlus /> JOIN
                  </>
                ) : (
                  <>
                    <FaEnvelope /> REQUEST
                  </>
                )}
              </Button>
            </TransactionQueueMask>
          )}
        </div>
      </div>
    </SecondaryCard>
  );
};
