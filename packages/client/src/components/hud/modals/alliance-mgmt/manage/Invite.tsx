import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { TextInput } from "@/components/core/TextInput";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { invite } from "@/network/setup/contractCalls/alliance";
import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { Hex, isAddress, padHex } from "viem";

export const Invite = () => {
  const mud = useMud();
  const [friendCode, setFriendCode] = useState("");

  return (
    <SecondaryCard className="flex-row justify-around items-center">
      <span>INVITE WITH FRIEND CODE</span>
      <TextInput
        placeholder="ENTER FRIEND CODE"
        onChange={(e) => setFriendCode(e.target.value)}
        className="w-48 uppercase h-6 text-xs"
      />
      <TransactionQueueMask queueItemId={"invite" as Entity}>
        <Button
          variant="primary"
          onClick={() => invite(mud, padHex(friendCode as Hex, { size: 32 }) as Entity)}
          className="btn-sm border-2 border-secondary"
          disabled={!friendCode || !isAddress(friendCode)}
        >
          SEND
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
