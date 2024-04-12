import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EAllianceRole } from "contracts/config/enums";
import { FaArrowLeft, FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Navigator } from "src/components/core/Navigator";
import { Tooltip } from "src/components/core/Tooltip";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import {
  acceptJoinRequest,
  declineInvite,
  joinAlliance,
  rejectJoinRequest,
} from "src/network/setup/contractCalls/alliance";
import { getAllianceName } from "src/util/alliance";
import { entityToAddress } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const InvitesScreen: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  const role = components.PlayerAlliance.use(playerEntity)?.role ?? EAllianceRole.Member;
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  const joinRequests = components.AllianceRequest.useAllWith({ alliance: playerAlliance ?? singletonEntity }) ?? [];
  const playerEntities = components.PlayerAlliance.useAllWith({
    alliance: playerAlliance,
  });
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;

  const full = playerEntities.length >= Number(maxAllianceMembers);

  return (
    <Navigator.Screen
      title="invites"
      className="flex flex-col items-center w-full h-full text-xs pointer-events-auto h-full overflow-hidden"
    >
      <div className="flex flex-grow w-full gap-2 mb-2">
        {!playerAlliance && (
          <div className={`w-full flex flex-col`}>
            <div className="flex justify-between items-center">
              <p className="font-bold p-1 opacity-75">INVITES</p>
            </div>

            <Join
              direction="vertical"
              className="overflow-auto w-full h-full scrollbar bg-neutral border border-secondary/25"
            >
              {invites.map((entity) => {
                const playerInvite = components.PlayerInvite.get(entity);
                const playerEntities = components.PlayerAlliance.getAllWith({
                  alliance: playerInvite?.alliance,
                });

                if (!playerInvite?.alliance) return <></>;

                return (
                  <SecondaryCard key={entity} className="border-b rounded-none flex-row justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <b>[{getAllianceName(playerInvite.alliance, true)}]</b>
                      <b className="opacity-75">{playerEntities.length} MEMBER(S)</b>
                    </div>

                    <div className="flex gap-1">
                      {/* only kick if not current player, has the ability to kick, and current player is higher than member */}
                      <TransactionQueueMask
                        queueItemId={hashEntities(TransactionQueueType.DeclineInvite, playerInvite.player)}
                      >
                        <Button
                          tooltip="Decline"
                          tooltipDirection="left"
                          className="btn-xs !rounded-box border-error"
                          onClick={() => declineInvite(mud, playerInvite.player)}
                        >
                          <FaTimes className="rounded-none" size={10} />
                        </Button>
                      </TransactionQueueMask>
                      <TransactionQueueMask
                        queueItemId={hashEntities(TransactionQueueType.JoinAlliance, playerInvite.alliance)}
                      >
                        <Button
                          tooltip="Accept"
                          tooltipDirection="left"
                          className="btn-xs !rounded-box border-success"
                          onClick={() => joinAlliance(mud, playerInvite.alliance)}
                        >
                          <FaCheck className="rounded-none" size={10} />
                        </Button>
                      </TransactionQueueMask>
                    </div>
                  </SecondaryCard>
                );
              })}
            </Join>
            <p className="p-1 opacity-50 text-right">{invites.length} invites(s)</p>
          </div>
        )}
        {role <= EAllianceRole.CanInvite && (
          <div className="w-full flex flex-col">
            <div className="flex justify-between items-center">
              <p className="font-bold p-1 opacity-75">REQUESTS</p>
            </div>
            {full && (
              <SecondaryCard className="w-full h-full font-bold items-center justify-center opacity-75 uppercase">
                alliance full
              </SecondaryCard>
            )}
            {!full && (
              <Join
                direction="vertical"
                className="overflow-auto w-full h-full scrollbar bg-neutral border border-secondary/25"
              >
                {joinRequests.map((entity) => {
                  const request = components.AllianceRequest.get(entity);

                  if (!request?.player) return <></>;

                  return (
                    <SecondaryCard key={entity} className="border-b rounded-none flex-row justify-between items-center">
                      <AccountDisplay player={request.player} />

                      <div className="flex gap-1">
                        {/* only kick if not current player, has the ability to kick, and current player is higher than member */}
                        <TransactionQueueMask
                          queueItemId={hashEntities(TransactionQueueType.RejectRequest, request.player)}
                        >
                          <Button
                            tooltip="Decline"
                            tooltipDirection="left"
                            className="btn-xs !rounded-box border-error"
                            onClick={() => rejectJoinRequest(mud, request.player)}
                          >
                            <FaTimes className="rounded-none" size={10} />
                          </Button>
                        </TransactionQueueMask>

                        <TransactionQueueMask
                          queueItemId={hashEntities(TransactionQueueType.AcceptRequest, request.player)}
                        >
                          <Button
                            tooltip="Accept"
                            tooltipDirection="left"
                            className="btn-xs !rounded-box border-success"
                            onClick={() => acceptJoinRequest(mud, request.player)}
                          >
                            <FaCheck className="rounded-none" size={10} />
                          </Button>
                        </TransactionQueueMask>
                      </div>
                    </SecondaryCard>
                  );
                })}
              </Join>
            )}
            <p className="p-1 opacity-50 text-right">{joinRequests.length} requests(s)</p>
          </div>
        )}
      </div>

      {role > EAllianceRole.CanInvite && playerAlliance && (
        <SecondaryCard className="w-full h-full items-center justify-center font-bold opacity-50 mb-2 text-center">
          NEED INVITE ROLE TO SEND INVITES OR ACCEPT JOIN REQUESTS
        </SecondaryCard>
      )}

      <div className="flex gap-1">
        <Navigator.BackButton>
          <FaArrowLeft />
        </Navigator.BackButton>
        <Navigator.NavButton to="send" className="btn-secondary btn-sm border-none" disabled={full || !playerAlliance}>
          SEND INVITE
        </Navigator.NavButton>
      </div>
      <div className="flex p-2 items-center">
        FRIEND CODE:
        <Tooltip text="Click to copy" direction="top">
          <Button
            className="btn-xs flex gap-1"
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
