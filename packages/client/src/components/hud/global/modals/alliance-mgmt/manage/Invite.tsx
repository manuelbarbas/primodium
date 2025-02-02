import { useState } from "react";
import { isAddress } from "viem";

import { toHex32 } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { TextInput } from "@/components/core/TextInput";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";

export const Invite = () => {
  const { invite } = useContractCalls();

  const [friendCode, setFriendCode] = useState("");

  return (
    <SecondaryCard className="flex-row justify-around items-center">
      <span>INVITE WITH FRIEND CODE</span>
      <TextInput
        placeholder="ENTER FRIEND CODE"
        onChange={(e) => setFriendCode(e.target.value)}
        className="w-48 uppercase h-6 text-xs"
      />
      <TransactionQueueMask queueItemId={"invite"}>
        <Button
          variant="primary"
          onClick={() => invite(toHex32(friendCode) as Entity)}
          className="btn-sm border-2 border-secondary"
          disabled={!friendCode || !isAddress(friendCode)}
        >
          SEND
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
