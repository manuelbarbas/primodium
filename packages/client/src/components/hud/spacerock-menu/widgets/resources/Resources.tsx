import { Entity } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { FleetActions } from "../fleet-send/FleetActions";
import { RelationLabel } from "../fleet-send/RelationLabel";
import { StationedUnitsLabel } from "../fleet-send/StationedUnitsLabel";
import { AllMaterialLabels } from "./material/AllMaterialLabels";
import { AllUnitLabels } from "./units/AllUnitLabels";
import { ElectricityLabel } from "./utilities/ElectricityLabel";
import { HousingLabel } from "./utilities/HousingLabel";

export const Resources: React.FC = () => {
  const { playerEntity } = useMud().network;
  const selectedRock = components.SelectedRock.use()?.value as Entity | undefined;
  const owner = components.OwnedBy.use(selectedRock)?.value as Entity | undefined;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center">
        <div className="relative w-full">
          <div className="w-full h-full absolute topographic-background rounded-box opacity-30 border border-secondary" />
          <AllMaterialLabels />
        </div>
        {playerEntity === owner && (
          <div className="flex items-center">
            <ElectricityLabel />
            <div className="relative w-full rounded">
              <div className="w-full h-full absolute star-background rounded-box opacity-50 border border-t-0 rounded-t-none border-secondary" />
              <AllUnitLabels />
            </div>
            <HousingLabel />
          </div>
        )}
        {playerEntity !== owner && (
          <div className="relative flex justify-center w-full">
            <div className="w-full h-full absolute star-background rounded-box opacity-50 border border-t-0 rounded-t-none border-secondary" />
            <RelationLabel />
            <FleetActions />
            <StationedUnitsLabel />
          </div>
        )}
      </div>
    </div>
  );
};
