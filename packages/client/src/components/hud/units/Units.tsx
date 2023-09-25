import { AllUnitLabels } from "./AllUnitLabels";
import { Card } from "../../core/Card";

export const Units: React.FC = () => (
  <Card className="flex flex-col gap-1">
    <AllUnitLabels />
  </Card>
);
