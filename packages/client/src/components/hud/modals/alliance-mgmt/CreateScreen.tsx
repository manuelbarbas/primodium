import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { Navigator } from "@/components/core/Navigator";
import { TextInput } from "@/components/core/TextInput";
import { Button } from "@/components/core/Button";
import { RadioGroup } from "@/components/core/Radio";
// import { TextArea } from "@/components/core/TextArea";
import { useMud } from "@/hooks";
import { createAlliance } from "@/network/setup/contractCalls/alliance";
import { isProfane } from "@/util/profanity";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";

export const ALLIANCE_TAG_SIZE = 6;

// This screen is only accessible to players who are not in an alliance
export const CreateScreen = () => {
  const mud = useMud();
  const [inviteOnly, setInviteOnly] = useState(true);
  const [allianceTag, setAllianceTag] = useState("");

  // TODO: implement description when implemented in backend
  return (
    <Navigator.Screen
      title="create"
      className="flex flex-col w-full text-sm pointer-events-auto h-full py-6 px-24 gap-8"
    >
      <div className="self-center text-base">CREATE ALLIANCE</div>
      <div className="grid grid-cols-[min-content_1fr] justify-center gap-8 whitespace-nowrap">
        <div className="mt-1">ALLIANCE TAG</div>
        <TextInput
          placeholder=""
          maxLength={ALLIANCE_TAG_SIZE}
          onChange={(e) => setAllianceTag(e.target.value)}
          className="w-48 uppercase h-8 text-sm"
        />
        {/* <div className="mt-1">DESCRIPTION</div>
        <TextArea placeholder="" className="min-h-20 text-sm" /> */}
        <div className="self-start mt-[10px]">RESTRICTION</div>
        <RadioGroup
          name="create-alliance-restriction"
          value={inviteOnly ? "closed" : "open"}
          options={[
            { id: "open", label: "OPEN" },
            { id: "closed", label: "CLOSED", bottomLabel: "INVITE ONLY" },
          ]}
          onChange={(value) => setInviteOnly(value === "closed")}
        />
      </div>

      <div className="flex mt-auto self-center gap-8">
        <Navigator.BackButton />
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.CreateAlliance, mud.playerAccount.entity)}>
          <Button
            disabled={!allianceTag || isProfane(allianceTag)}
            onClick={() => createAlliance(mud, allianceTag, inviteOnly)}
            variant="primary"
            className="btn-sm border-2 border-secondary flex gap-2"
          >
            <FaPlus />
            CREATE
          </Button>
        </TransactionQueueMask>
      </div>
    </Navigator.Screen>
  );
};
