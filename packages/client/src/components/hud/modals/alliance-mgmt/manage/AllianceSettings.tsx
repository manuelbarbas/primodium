import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { RadioGroup } from "@/components/core/Radio";
import { TextInput } from "@/components/core/TextInput";
import { Tooltip } from "@/components/core/Tooltip";
import { ALLIANCE_TAG_SIZE } from "@/components/hud/modals/alliance-mgmt/CreateScreen";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { useAllianceName } from "@/hooks/useAllianceName";
import { components } from "@/network/components";
import { leaveAlliance, updateAllianceAccess, updateAllianceName } from "@/network/setup/contractCalls/alliance";
import { MUD } from "@/network/types";
import { cn } from "@/util/client";
import { entityToAddress } from "@/util/common";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { useState } from "react";
import { FaCopy, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
// import { TextArea } from "@/components/core/TextArea";

export const AllianceSettings = ({
  allianceEntity,
  playerEntity,
}: {
  allianceEntity: Entity;
  playerEntity: Entity;
}) => {
  const mud = useMud();
  const alliance = components.Alliance.use(allianceEntity);

  const wasInviteOnly = (alliance?.inviteMode ?? EAllianceInviteMode.Open) as EAllianceInviteMode;
  const currName = useAllianceName(allianceEntity, true);

  const playerRole = components.PlayerAlliance.use(playerEntity)?.role ?? EAllianceRole.Member;

  const [inviteOnly, setInviteOnly] = useState(wasInviteOnly);
  const [allianceTag, setAllianceTag] = useState(currName);

  return (
    <SecondaryCard
      className={cn(
        playerRole === EAllianceRole.Owner ? "justify-between" : "justify-center",
        "flex flex-col h-full items-center gap-4"
      )}
    >
      {playerRole === EAllianceRole.Owner && (
        <div className="grid grid-cols-[min-content_1fr_6rem] items-center p-4 gap-4 whitespace-nowrap">
          <span className="opacity-80">NAME</span>
          <TextInput
            placeholder=""
            maxLength={ALLIANCE_TAG_SIZE}
            value={allianceTag}
            onChange={(e) => setAllianceTag(e.target.value)}
            className="w-48 uppercase h-8 text-sm"
          />
          <TransactionQueueMask
            queueItemId={hashEntities(TransactionQueueType.CreateAlliance, mud.playerAccount.entity)}
          >
            <Button
              disabled={allianceTag == currName}
              onClick={() => updateAllianceName(mud, allianceEntity, allianceTag)}
              className="w-full"
            >
              Update
            </Button>
          </TransactionQueueMask>
          <span className="opacity-80">ACCESS</span>
          <RadioGroup
            name="create-alliance-restriction"
            value={inviteOnly == EAllianceInviteMode.Closed ? "closed" : "open"}
            options={[
              { id: "open", label: "OPEN" },
              { id: "closed", label: "INVITE ONLY" },
            ]}
            onChange={(value) =>
              setInviteOnly(value === "open" ? EAllianceInviteMode.Open : EAllianceInviteMode.Closed)
            }
          />
          <TransactionQueueMask
            queueItemId={hashEntities(TransactionQueueType.CreateAlliance, mud.playerAccount.entity)}
          >
            <Button
              disabled={inviteOnly == wasInviteOnly}
              onClick={() => updateAllianceAccess(mud, allianceEntity, inviteOnly === EAllianceInviteMode.Closed)}
              className="w-full"
            >
              Update
            </Button>
          </TransactionQueueMask>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex justify-center items-center gap-8">
          FRIEND CODE
          <Tooltip tooltipContent="Click to copy" direction="top">
            <Button
              variant="ghost"
              size="xs"
              className="text-accent flex gap-2"
              onClick={() => navigator.clipboard.writeText(entityToAddress(playerEntity))}
            >
              {entityToAddress(playerEntity, true)}
              <FaCopy />
            </Button>
          </Tooltip>
        </div>
        <div className="relative flex justify-center w-full">
          <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.LeaveAlliance, playerEntity)}>
            <Button
              tooltip={inviteOnly ? "You will need to request to join again" : undefined}
              tooltipDirection="top"
              variant="error"
              onClick={() => (playerRole === EAllianceRole.Owner ? confirmLeaveAlliance(mud) : leaveAlliance(mud))}
              className="btn-sm"
            >
              LEAVE
            </Button>
          </TransactionQueueMask>
        </div>
      </div>
    </SecondaryCard>
  );
};

const confirmLeaveAlliance = async (mud: MUD) => {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
          <FaExclamationTriangle size={24} className="text-warning" />
          Are you sure you want to leave the alliance? Leadership will be transferred to the next highest ranking
          member.
        </div>

        <div className="flex justify-center w-full gap-2">
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => {
              leaveAlliance(mud);
              closeToast && closeToast();
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => {
              closeToast && closeToast();
            }}
            className="btn btn-primary btn-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      // className: "border-error",
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      hideProgressBar: true,
    }
  );
};
