import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { Navigator } from "src/components/core/Navigator";
import { TextInput } from "src/components/core/TextInput";
import { useMud } from "src/hooks";
import { invite } from "src/network/setup/contractCalls/alliance";
import { Hex, isAddress, padHex } from "viem";

export const SendInviteScreen = () => {
  const mud = useMud();
  const [targetAddress, setTargetAddress] = useState("");

  return (
    <Navigator.Screen
      title="send"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full my-5"
    >
      <div className="flex items-center gap-2">
        <TextInput
          placeholder="0x..."
          topLeftLabel="ENTER FRIEND CODE"
          maxLength={42}
          onChange={(e) => {
            setTargetAddress(e.target.value);
          }}
          className="text-center font-bold"
        />
      </div>

      <div className="flex gap-1 mt-auto">
        <Navigator.BackButton
          disabled={!targetAddress || !isAddress(targetAddress)}
          className="btn-primary btn-sm"
          onClick={() => {
            invite(mud, padHex(targetAddress as Hex, { size: 32 }) as Entity);
          }}
        >
          Invite
        </Navigator.BackButton>
        <Navigator.BackButton>Back</Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};
