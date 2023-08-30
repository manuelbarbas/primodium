import { ActiveAsteroid, Send } from "src/network/components/clientComponents";
import { UnitDeployment } from "./unit-deployment/UnitDeployment";
import { useMemo } from "react";
import { AsteroidInfo } from "./AsteroidInfo";
import { Position } from "src/network/components/chainComponents";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { BeltMap } from "@game/constants";
import { primodium } from "@game/api";

export const StarmapUI: React.FC = () => {
  const send = Send.use();
  const { origin, destination } = useMemo(
    () => ({
      origin: Send.getOrigin()?.entity,
      destination: Send.getDestination()?.entity,
    }),
    [send?.originX, send?.originY, send?.destinationX, send?.destinationY]
  );
  const { pan } = primodium.api(BeltMap.KEY)!.camera;

  return (
    <div className="absolute top-0 left-0 w-full h-full p-5 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full">
        <div className="flex flex-col gap-2 absolute top-0 left-0 pointer-events-auto">
          {origin && <AsteroidInfo asteroid={origin} title="Origin" />}
          {destination && (
            <AsteroidInfo asteroid={destination} title="Target" />
          )}
        </div>
        <UnitDeployment />

        <button
          className="absolute bottom-2 right-2 text-xs border rounded-md bg-slate-700 border-cyan-700 outline-none bg-gradient-to-b from-transparent to-slate-900/20 p-2 pointer-events-auto"
          onClick={() => {
            const asteroid = ActiveAsteroid.get()?.value;
            const position = Position.get(asteroid);

            if (!position) return;
            requestAnimationFrame(() => pan(position));
          }}
        >
          <FaLocationCrosshairs size={20} />
        </button>
      </div>
    </div>
  );
};
