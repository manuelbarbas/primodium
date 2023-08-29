import { Send } from "src/network/components/clientComponents";
import { TestArrivalPane } from "./unit-deployment/TestArrivalPane";
import { UnitDeployment } from "./unit-deployment/UnitDeployment";
import { useMemo } from "react";
import { AsteroidInfo } from "./AsteroidInfo";

export const StarmapUI: React.FC = () => {
  const send = Send.use();
  const { origin, destination } = useMemo(
    () => ({
      origin: Send.getOrigin()?.entity,
      destination: Send.getDestination()?.entity,
    }),
    [send?.originX, send?.originY, send?.destinationX, send?.destinationY]
  );
  return (
    <div className="absolute top-0 left-0 w-full h-full p-5 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full">
        <div className="flex flex-col gap-2 absolute top-0 left-0 pointer-events-auto">
          {origin && <AsteroidInfo asteroid={origin} title="Origin" />}
          {destination && (
            <AsteroidInfo asteroid={destination} title="Destination" />
          )}
        </div>
        <UnitDeployment />
        <TestArrivalPane />
      </div>
    </div>
  );
};
