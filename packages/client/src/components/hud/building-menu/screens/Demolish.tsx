import { Entity } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { useBuildingName } from "src/hooks/useBuildingName";
import { components } from "src/network/components";
import { demolishBuilding } from "src/util/web3/contractCalls/demolishBuilding";

export const Demolish: React.FC<{ building: Entity }> = ({ building }) => {
  const network = useMud().network;

  const name = useBuildingName(building);
  return (
    <Navigator.Screen title="Demolish">
      <SecondaryCard className="space-y-3 items-center text-center w-full">
        <p>
          Are you sure you want to demolish <b>{name}</b>?{" "}
        </p>

        <div className="flex gap-2">
          <Button
            className="btn-error btn-sm"
            onClick={() => {
              demolishBuilding(building, network);
              components.SelectedBuilding.remove();
            }}
          >
            Demolish
          </Button>
          <Navigator.BackButton className="btn-sm border-secondary" />
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
