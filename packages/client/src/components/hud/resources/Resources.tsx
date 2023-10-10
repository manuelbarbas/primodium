import { AllMaterialLabels } from "./materials/AllMaterialLabels";
import { AllUtilityLabels } from "./utilities/AllUtilityLabels";
import { Card } from "../../core/Card";

export const Resources: React.FC = () => (
  <Card className="flex flex-col gap-1">
    {/* <AllUtilityLabels /> */}
    <AllMaterialLabels />
  </Card>
);
