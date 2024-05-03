import { entityToColor } from "@/util/color";
import { Entity } from "@latticexyz/recs";
import { FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { Tooltip } from "src/components/core/Tooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { declineInvite, joinAlliance } from "src/network/setup/contractCalls/alliance";
import { getAllianceName } from "src/util/alliance";
import { entityToAddress } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

// This screen is only accessible to players who are not in an alliance
export const InvitesScreen: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  const playerEntities = components.PlayerAlliance.useAllWith({
    alliance: playerAlliance,
  });
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;

  const full = playerEntities.length >= Number(maxAllianceMembers);

  return (
    <Navigator.Screen
      title="invites"
      className="grid grid-rows-[min-content_1fr_min-content] gap-8 w-full text-xs pointer-events-auto h-full overflow-hidden py-6 px-24"
    >
      <div className="justify-self-center text-base">INVITES</div>
      {invites.length > 0 ? (
        <div className="flex flex-col gap-4">
          <span className="underline">INVITATION{invites.length > 1 ? "S" : ""} RECEIVED</span>
          <div className="grid grid-cols-[min-content_1fr_min-content_min-content] gap-4">
            {invites.map((entity, i) => {
              const playerInvite = components.PlayerInvite.get(entity);
              const playerEntities = components.PlayerAlliance.getAllWith({
                alliance: playerInvite?.alliance,
              });

              if (!playerInvite?.alliance) return null;

              return (
                <>
                  <span className="mr-2">{i + 1}.</span>
                  <div className="flex gap-2">
                    <span style={{ color: entityToColor(entity) }}>
                      [{getAllianceName(playerInvite.alliance, true)}]
                    </span>
                    <span className="opacity-75">
                      ({playerEntities.length} MEMBER{playerEntities.length > 1 ? "S" : ""})
                    </span>
                  </div>
                  <TransactionQueueMask
                    queueItemId={hashEntities(TransactionQueueType.JoinAlliance, playerInvite.alliance)}
                  >
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
                  <TransactionQueueMask
                    queueItemId={hashEntities(TransactionQueueType.DeclineInvite, playerInvite.player)}
                  >
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
            })}
          </div>
        </div>
      ) : (
        <span className="opacity-75">NO INVITATION RECEIVED</span>
      )}
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
    </Navigator.Screen>
  );
};
