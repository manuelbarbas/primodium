import { TargetInfo } from "./TargetInfo";
import { UnitDeploymentBar } from "./UnitDeploymentBar";

export const StarmapUI: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full p-5 pointer-events-none">
      <div className="relative w-full h-full">
        <TargetInfo />
        <UnitDeploymentBar />
      </div>
    </div>
  );
};
