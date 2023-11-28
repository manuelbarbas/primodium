import { AllOreLabels } from "./ores/AllOreLabels";
import { AllUnitLabels } from "./units/AllUnitLabels";
import { AllUtilityLabels } from "./utilities/AllUtilityLabels";

export const Resources: React.FC = () => (
  <div className="flex flex-col items-center">
    <div>
      <AllOreLabels />
      {/* <AllUnitLabels /> */}
    </div>
    <div className="flex">{/* <AllUtilityLabels /> */}</div>
  </div>
);
