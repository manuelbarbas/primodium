import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaEye } from "react-icons/fa";
import { components } from "src/network/components";
import { SecondaryCard } from "../core/Card";
import { Score } from "./Score";
import { TargetHeader } from "./spacerock-menu/TargetHeader";

export const SpectatingDetails = () => {
  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = (components.OwnedBy.use(activeRock)?.value ?? singletonEntity) as Entity;

  return (
    <div className="flex flex-col gap-2">
      <SecondaryCard className="items-center justify-center min-w-fit !p-0 border-b-0">
        <div className="flex flex-col items-center">
          <p className="font-bold opacity-50 uppercase text-xs p-2 flex items-center gap-2">
            <FaEye />
            spectating
          </p>

          <SecondaryCard className="flex-row w-full gap-1 border-none">
            <TargetHeader entity={activeRock} />
          </SecondaryCard>
        </div>

        <Score player={ownedBy} />
      </SecondaryCard>
    </div>
  );
};
