import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { RadioGroup } from "@/components/core/Radio";
import { TextInput } from "@/components/core/TextInput";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";
import { useAccountClient } from "@primodiumxyz/core/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export const ALLIANCE_TAG_SIZE = 6;

// This screen is only accessible to players who are not in an alliance
export const CreateScreen = () => {
  const [inviteOnly, setInviteOnly] = useState(true);
  const [allianceTag, setAllianceTag] = useState("");
  const { createAlliance } = useContractCalls();
  const { playerAccount } = useAccountClient();

  // TODO: implement description when implemented in backend
  return (
    <Navigator.Screen title="create" className="flex flex-col w-full text-sm pointer-events-auto h-full p-4 gap-4">
      <p className="self-center text-base">CREATE ALLIANCE</p>
      <SecondaryCard className="grid grid-cols-[min-content_1fr] items-center py-4 px-24 gap-4 whitespace-nowrap">
        <span className="opacity-80">NAME</span>
        <TextInput
          placeholder=""
          maxLength={ALLIANCE_TAG_SIZE}
          onChange={(e) => setAllianceTag(e.target.value.toUpperCase())}
          className="w-48 uppercase h-8 text-sm"
        />
        <span className="opacity-80">ACCESS</span>
        <RadioGroup
          name="create-alliance-restriction"
          value={inviteOnly ? "closed" : "open"}
          options={[
            { id: "open", label: "OPEN" },
            { id: "closed", label: "INVITE ONLY" },
          ]}
          onChange={(value) => setInviteOnly(value === "closed")}
        />
      </SecondaryCard>

      <div className="flex mt-auto self-center gap-8">
        <Navigator.BackButton />
        <TransactionQueueMask queueItemId={`create-${playerAccount.entity}`}>
          <Button
            disabled={!allianceTag}
            onClick={() => createAlliance(allianceTag, inviteOnly)}
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
