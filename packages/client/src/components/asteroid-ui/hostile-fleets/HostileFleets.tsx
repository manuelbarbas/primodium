import { useState } from "react";
import { OrbitingFleets } from "./OrbitingFleets";
import { IncomingFleets } from "./IncomingFleets";
import { EntityID } from "@latticexyz/recs";

export const HostileFleets: React.FC<{
  spacerock: EntityID;
  small?: boolean;
}> = ({ spacerock, small }) => {
  const [index, setIndex] = useState<number>(0);

  return (
    <div
      className={`flex flex-col items-center gap-2 text-white w-96 h-32 min-w-full ${
        small ? "h-32" : "h-96"
      }`}
    >
      <div className="w-full flex items-center justify-center mt-2 gap-2">
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 0 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(0)}
        >
          Incoming
        </button>
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 1 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(1)}
        >
          Orbiting
        </button>
      </div>

      {index === 0 && <IncomingFleets spaceRock={spacerock} />}
      {index === 1 && <OrbitingFleets spaceRock={spacerock} />}
    </div>
  );
};
