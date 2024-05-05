import { entityToColor } from "@/util/color";
import { Entity } from "@latticexyz/recs";
import { FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { Button } from "@/components/core/Button";
import { Navigator } from "@/components/core/Navigator";
import { Tooltip } from "@/components/core/Tooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { declineInvite, joinAlliance } from "@/network/setup/contractCalls/alliance";
import { getAllianceName } from "@/util/alliance";
import { entityToAddress } from "@/util/common";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";

// This screen is only accessible to players who are not in an alliance
export const InvitesScreen: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;

  return (
    <Navigator.Screen
      title="invites"
      className="grid grid-rows-[min-content_1fr_min-content] gap-8 w-full text-xs pointer-events-auto h-full overflow-hidden py-6 px-24"
    >
      <div className="justify-self-center text-base">INVITES</div>
      {invites.length > 0 ? (
        <div className="flex flex-col gap-4">
          <span className="underline">INVITATION{invites.length > 1 ? "S" : ""} RECEIVED</span>
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={invites.length} itemSize={35} className="scrollbar">
                {({ index, style }) => {
                  return (
                    <div style={style} className="grid grid-cols-[40px_1fr_min-content_min-content] gap-4 pr-4">
                      <InviteItem key={index} index={index} entity={invites[index]} max={maxAllianceMembers} />
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      ) : (
        <span className="opacity-75">NO INVITATION RECEIVED</span>
      )}
      <div className="flex justify-between pt-4">
        <Navigator.BackButton />
        <div className="flex justify-center items-center gap-8">
          FRIEND CODE:
          <Tooltip tooltipContent="Click to copy" direction="top">
            <Button
              variant="ghost"
              className="btn-xs flex gap-2"
              onClick={() => navigator.clipboard.writeText(entityToAddress(playerEntity))}
            >
              {entityToAddress(playerEntity, true)}
              <FaCopy />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Navigator.Screen>
  );
};

const InviteItem = ({ index, entity, max }: { index: number; entity: Entity; max: bigint }) => {
  const mud = useMud();
  const playerInvite = components.PlayerInvite.get(entity);
  const playerEntities = components.PlayerAlliance.getAllWith({
    alliance: playerInvite?.alliance,
  });
  const full = playerEntities.length >= Number(max);

  if (!playerInvite?.alliance) return null;
  return (
    <>
      <span>{index + 1}.</span>
      <div className="flex gap-2">
        <span style={{ color: entityToColor(entity) }}>[{getAllianceName(playerInvite.alliance, true)}]</span>
        <span className="opacity-75">
          ({playerEntities.length} MEMBER{playerEntities.length > 1 ? "S" : ""})
        </span>
      </div>
      <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.JoinAlliance, playerInvite.alliance)}>
        <Button
          tooltip={full ? "alliance full" : "accept"}
          variant="ghost"
          tooltipDirection="top"
          className="btn-xs border-none !rounded-box text-success"
          onClick={() => joinAlliance(mud, playerInvite.alliance)}
          disabled={full}
        >
          <FaCheck className="rounded-none" />
        </Button>
      </TransactionQueueMask>
      <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.DeclineInvite, playerInvite.player)}>
        <Button
          tooltip="decline"
          tooltipDirection="top"
          variant="ghost"
          className="btn-xs border-none !rounded-box text-error"
          onClick={() => declineInvite(mud, playerInvite.player)}
        >
          <FaTimes className="rounded-none" />
        </Button>
      </TransactionQueueMask>
    </>
  );
};
