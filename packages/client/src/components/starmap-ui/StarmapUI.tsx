import { TargetInfo } from "./TargetInfo";
import { TestArrivalPane } from "./unit-deployment/TestArrivalPane";
import { UnitDeployment } from "./unit-deployment/UnitDeployment";

export const StarmapUI: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full p-5 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full">
        <TargetInfo />
        <UnitDeployment />
        <TestArrivalPane />
      </div>
    </div>
  );
};
