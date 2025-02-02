import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { useState } from "react";
import { FaCopy } from "react-icons/fa";

import { entityToAddress } from "@primodiumxyz/core";
import { useAllianceName, useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { RadioGroup } from "@/components/core/Radio";
import { TextInput } from "@/components/core/TextInput";
import { Tooltip } from "@/components/core/Tooltip";
import { ALLIANCE_TAG_SIZE } from "@/components/hud/global/modals/alliance-mgmt/CreateScreen";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";
import { useGame } from "@/hooks/useGame";
import { alert } from "@/util/alert";
import { cn } from "@/util/client";

export const AllianceSettings = ({
  allianceEntity,
  playerEntity,
}: {
  allianceEntity: Entity;
  playerEntity: Entity;
}) => {
  const game = useGame();
  const { tables } = useCore();
  const { updateAllianceName, updateAllianceAccess, leaveAlliance } = useContractCalls();
  const alliance = tables.Alliance.use(allianceEntity);

  const wasInviteOnly = (alliance?.inviteMode ?? EAllianceInviteMode.Open) as EAllianceInviteMode;
  const currName = useAllianceName(allianceEntity, true);

  const playerRole = tables.PlayerAlliance.use(playerEntity)?.role ?? EAllianceRole.Member;

  const [inviteOnly, setInviteOnly] = useState(wasInviteOnly);
  const [allianceTag, setAllianceTag] = useState(currName);

  return (
    <SecondaryCard
      className={cn(
        playerRole === EAllianceRole.Owner ? "justify-between" : "justify-center",
        "flex flex-col h-full items-center gap-4",
      )}
    >
      {playerRole === EAllianceRole.Owner && (
        <div className="grid grid-cols-[min-content_1fr_6rem] items-center p-4 gap-4 whitespace-nowrap">
          <span className="opacity-80">NAME</span>
          <TextInput
            placeholder=""
            maxLength={ALLIANCE_TAG_SIZE}
            value={allianceTag}
            onChange={(e) => setAllianceTag(e.target.value.toUpperCase())}
            className="w-48 uppercase h-8 text-sm"
          />
          <TransactionQueueMask queueItemId={`update-alliance-name`}>
            <Button
              disabled={allianceTag == currName}
              onClick={() => updateAllianceName(allianceEntity, allianceTag)}
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
          <TransactionQueueMask queueItemId={`update-access`}>
            <Button
              disabled={inviteOnly == wasInviteOnly}
              onClick={() => updateAllianceAccess(allianceEntity, inviteOnly === EAllianceInviteMode.Closed)}
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
          <TransactionQueueMask queueItemId="leave-alliance">
            <Button
              tooltip={inviteOnly ? "You will need to request to join again" : undefined}
              tooltipDirection="right"
              variant="error"
              onClick={() =>
                playerRole === EAllianceRole.Owner
                  ? alert(
                      "Are you sure you want to leave the alliance? Leadership will be transferred to the next highest ranking member.",
                      leaveAlliance,
                      game,
                    )
                  : leaveAlliance()
              }
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
