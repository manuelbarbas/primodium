import { useState } from "react";
import { Checkbox } from "src/components/core/Checkbox";
import { Navigator } from "src/components/core/Navigator";
import { TextInput } from "src/components/core/TextInput";
import { useMud } from "src/hooks";
import { createAlliance } from "src/network/setup/contractCalls/alliance";
import { isProfane } from "src/util/profanity";

const ALLIANCE_TAG_SIZE = 6;

export const CreateScreen = () => {
  const mud = useMud();
  const [inviteOnly, setInviteOnly] = useState(true);
  const [allianceTag, setAllianceTag] = useState("");

  return (
    <Navigator.Screen
      title="create"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full my-5"
    >
      <div className="flex items-center gap-2">
        <b className="text-2xl">[</b>
        <TextInput
          placeholder=""
          bottomLeftLabel={`MAX ${ALLIANCE_TAG_SIZE} CHAR.`}
          topLeftLabel="ENTER ALLIANCE TAG"
          maxLength={ALLIANCE_TAG_SIZE}
          onChange={(e) => {
            setAllianceTag(e.target.value);
          }}
          className="text-center font-bold uppercase"
        />
        <b className="text-2xl">]</b>
      </div>

      <Checkbox label="INVITE ONLY" className="checkbox-error" defaultChecked onChange={setInviteOnly} />

      <div className="flex gap-1 mt-auto">
        <Navigator.BackButton
          disabled={!allianceTag || isProfane(allianceTag)}
          className="btn-primary btn-sm"
          onClick={() => createAlliance(mud, allianceTag, inviteOnly)}
        >
          Create
        </Navigator.BackButton>
        <Navigator.BackButton>Back</Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};
