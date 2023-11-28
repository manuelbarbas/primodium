import { AllMaterialLabels } from "./material/AllMaterialLabels";
import { AllUnitLabels } from "./units/AllUnitLabels";
import { ElectricityLabel } from "./utilities/ElectricityLabel";
import { HousingLabel } from "./utilities/HousingLabel";

export const Resources: React.FC = () => (
  <div className="flex flex-col items-center">
    <div className="flex flex-col items-center">
      <div className="relative w-full rounded">
        <div className="w-full h-full absolute topographic-background rounded-box opacity-30 border border-secondary" />
        <AllMaterialLabels />
      </div>
      <div className="flex items-center">
        <ElectricityLabel />
        <div className="relative w-full rounded">
          <div className="w-full h-full absolute star-background rounded-box opacity-50 border border-t-0 rounded-t-none border-secondary" />
          <AllUnitLabels />
        </div>
        <HousingLabel />
      </div>
    </div>
  </div>
);
