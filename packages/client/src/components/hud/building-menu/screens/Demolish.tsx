import { EntityID } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { Position } from "src/network/components/chainComponents";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { getBuildingName } from "src/util/building";
import { demolishBuilding } from "src/util/web3";

export const Demolish: React.FC<{ building: EntityID }> = ({ building }) => {
  const network = useMud();
  const position = Position.get(building) ?? { x: 0, y: 0 };

  return (
    <Navigator.Screen title="Demolish">
      <SecondaryCard className="space-y-3 items-center text-center">
        <p>
          Are you sure you want to demolish <b>{getBuildingName(building)}</b>?{" "}
        </p>
        <Join className="border-error">
          <Button
            className="btn-error btn-sm"
            onClick={() => {
              demolishBuilding(position, network);
              SelectedBuilding.remove();
            }}
          >
            Demolish
          </Button>
          <Navigator.BackButton className="btn-sm" />
        </Join>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
