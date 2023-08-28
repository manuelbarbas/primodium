import { useState } from "react";
import { IncomingFleets } from "./IncomingFleets";
import { OrbitingFleets } from "./OrbitingFleets";
import { ESendType } from "src/util/web3/types";
import { FaGreaterThan, FaTimes, FaTrophy } from "react-icons/fa";

const battles = [
  {
    result: 1,
    location: { x: 0, y: 0 },
    type: 0,
    timestamp: 123123,
  },
  {
    result: 0,
    location: { x: 0, y: 0 },
    type: 0,
    timestamp: 123123,
  },
];

export const LabeledValue: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ children, label }) => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const BattleReports = () => {
  const [selectedBattle, setSelectedBattle] = useState<number>(0);

  return (
    <div className="flex flex-col items-center gap-2 text-white w-96 min-w-full">
      <div className="w-full text-xs space-y-3 h-96 overflow-y-auto">
        {battles.length === 0 && (
          <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
            <p className="opacity-50">NO BATTLE REPORTS FOUND</p>
          </div>
        )}
        {battles.length !== 0 &&
          battles.map((battle, index) => (
            <button
              key={index}
              className="relative flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 hover:border-cyan-400 outline-none"
            >
              <div className="flex gap-1 items-center">
                {battle.result === 0 && (
                  <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                    <FaTimes size={16} />
                    <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
                      LOSS
                    </p>
                  </div>
                )}
                {battle.result === 1 && (
                  <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                    <FaTrophy size={16} />
                    <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
                      WIN
                    </p>
                  </div>
                )}

                <LabeledValue label="LOCATION">
                  <p>
                    [{battle.location.x}, {battle.location.y}]
                  </p>
                </LabeledValue>
              </div>
              <LabeledValue label="TYPE">
                <p>RAID</p>
              </LabeledValue>
              <div className="text-right">
                <LabeledValue label="TIMESTAMP">
                  <div className="flex gap-1">
                    <span className="opacity-50">BLOCK</span>
                    <p>{battle.timestamp}</p>
                  </div>
                </LabeledValue>
              </div>

              <div className="flex items-center gap-1 px-1 absolute bottom-0 right-1 text-[.6rem] border rounded-md border-cyan-800 bg-slate-700 translate-y-1/2">
                VIEW DETAILS <FaGreaterThan />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};
