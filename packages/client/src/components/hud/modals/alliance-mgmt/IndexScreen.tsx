import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode } from "contracts/config/enums";
import { FaCheck, FaEnvelope, FaLock, FaPlus, FaSearch } from "react-icons/fa";
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
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { cn } from "@/util/client";
import { useMemo, useState } from "react";
import { TextInput } from "@/components/core/TextInput";
import { ALLIANCE_TAG_SIZE } from "@/components/hud/modals/alliance-mgmt/CreateScreen";

// TODO: add the amount of members to alliance so we can show it
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
    console.log("invites", invites);
    console.log("joinRequests", joinRequests);
    console.log("allianceEntities", allianceEntities);

    const allAlliances = allianceEntities?.map((entity, i) => ({
      entity,
      name: allianceNames![i],
      invited: invites.some((invite: Entity) => invite.includes(entity.slice(0, 2))),
      requested: joinRequests.some((request: Entity) => request.includes(entity.slice(0, 2))),
    }));
    if (!searchTag) return allAlliances;
    // TODO: better search algorithm
    return allAlliances?.filter((alliance) => alliance.name.toLowerCase().includes(searchTag.toLowerCase()));
  }, [searchTag, allianceEntities, allianceNames, invites, joinRequests]);

  return (
    <Navigator.Screen
      title="score"
      className="grid grid-rows-[min-content_1fr_min-content] w-full h-full text-xs pointer-events-auto py-6 px-24 gap-8"
    >
      <div className="flex flex-col items-center gap-2 text-base">
        <div>ALLIANCE</div>
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
      {alliances ? (
        <div>
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={alliances.length} itemSize={47} className="scrollbar">
                {({ index, style }) => {
                  return (
                    <div style={style} className="pr-4">
                      <AllianceItem key={index} {...alliances[index]} />
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      ) : (
        <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
          NO ALLIANCES
        </SecondaryCard>
      )}
      <div className="flex justify-center gap-8">
        <Navigator.NavButton to="create" variant="primary" className="btn-sm border-2 border-secondary flex gap-2">
          <FaPlus />
          CREATE
        </Navigator.NavButton>
        <Navigator.NavButton to="invites" variant="primary" className="btn-sm border-2 border-secondary">
          INVITES ({invites.length})
        </Navigator.NavButton>
      </div>
    </Navigator.Screen>
  );
};

const AllianceItem = ({
  name,
  entity,
  invited,
  requested,
  className,
}: {
  name: string;
  entity: Entity;
  invited: boolean;
  requested: boolean;
  className?: string;
}) => {
  const mud = useMud();
  const allianceMode = components.Alliance.get(entity)?.inviteMode as EAllianceInviteMode | undefined;
  const inviteOnly = allianceMode === EAllianceInviteMode.Closed;

  return (
    <SecondaryCard
      className={cn(
        "grid grid-cols-[1fr_min-content] w-full p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-10",
        className
      )}
    >
      <div className="col-span-6 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <p className="text-sm text-warning">[{name}]</p>
          {inviteOnly ? <FaLock /> : null}
        </div>
        <div className="flex items-center gap-1">
          {
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.JoinAlliance, entity)}>
              <Button
                className="btn-xs"
                onClick={() => {
                  inviteOnly ? requestToJoin(mud, entity) : joinAlliance(mud, entity);
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
          }
        </div>
      </div>
    </SecondaryCard>
  );
};
