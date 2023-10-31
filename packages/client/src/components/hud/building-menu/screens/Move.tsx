import { Entity } from "@latticexyz/recs";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { getBuildingName } from "src/util/building";

export const Move: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title="Move">
      <SecondaryCard className="space-y-3 items-center text-center w-full">
        <p>
          Select a new position for <b>{getBuildingName(building)}</b>.
        </p>

        <div className="flex gap-2">
          <Navigator.BackButton
            className="btn-sm border-secondary"
            onClick={() => {
              components.SelectedAction.remove();
            }}
          />
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
