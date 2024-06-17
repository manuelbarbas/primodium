import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";

export const Move: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables, utils } = useCore();
  const name = utils.getBuildingName(building);
  return (
    <Navigator.Screen title="Move">
      <SecondaryCard className="space-y-3 items-center text-center w-full">
        <p>
          Select a new position for <b>{name}</b>.
        </p>

        <div className="flex gap-2">
          <Navigator.BackButton
            className="btn-sm border-secondary"
            onClick={() => {
              tables.SelectedAction.remove();
            }}
          />
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
