import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { RockRelationship } from "src/util/constants";
import { getRockRelationship } from "src/util/spacerock";

export const RelationLabel = () => {
  const selectedRock = components.SelectedRock.use()?.value;
  const { playerEntity } = useMud().network;
  const relation = getRockRelationship(playerEntity, selectedRock ?? singletonEntity);

  const relationText = (() => {
    switch (relation) {
      case RockRelationship.Ally:
        return "ally";
      case RockRelationship.Enemy:
        return "enemy";
      case RockRelationship.Neutral:
        return "neutral";
      default:
        return "neutral";
    }
  })();

  return (
    <div className="absolute top-0 left-0 flex flex-col items-center gap-1 w-fit">
      <SecondaryCard className="flex flex-row w-fit gap-1 items-center rounded-r-none border-t-0">
        <p className="font-bold uppercase text-sm">{relationText}</p>
      </SecondaryCard>
      <p className="text-xs opacity-75 font-bold">STATUS</p>
    </div>
  );
};
