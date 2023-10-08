import { primodium } from "@game/api";
import { BeltMap } from "@game/constants";
import { useMemo } from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { Position } from "src/network/components/chainComponents";
import { ActiveAsteroid, Send } from "src/network/components/clientComponents";
import { AsteroidInfo } from "./AsteroidInfo";
import { UnitDeployment } from "./unit-deployment/UnitDeployment";
import { UserPanel } from "./user-panel/UserPanel";

export const StarmapUI: React.FC = () => {
  const send = Send.use();
  const { destination } = useMemo(
    () => ({
      destination: Send.getDestination()?.entity,
    }),
    [send?.destinationX, send?.destinationY]
  );
  const { pan } = primodium.api(BeltMap.KEY)!.camera;

  return (
    <div className="absolute top-0 left-0 w-full h-full p-5 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full">
        <div className="flex flex-col gap-2 absolute top-0 left-0 pointer-events-auto">
          {/* {origin && <AsteroidInfo asteroid={origin} title="Origin" />} */}
          {destination && <AsteroidInfo asteroid={destination} title="Target" />}
          {/* {player && <UserFleets user={player} />} */}
        </div>
        <UnitDeployment />

        <UserPanel />

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
