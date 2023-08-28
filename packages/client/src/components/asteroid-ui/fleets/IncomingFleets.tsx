import { BiSolidInvader } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { BlockNumber } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";

const incomingFleets = [
  {
    target: { x: 0, y: 0 },
    arrivalTime: 900000,
    type: 0,
  },
  {
    target: { x: 40, y: -6 },
    arrivalTime: 900000,
    type: 1,
  },
];

export const LabeledValue: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ children, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const IncomingFleets = () => {
  const blockNumber = BlockNumber.use()?.value;

  return (
    <div className="w-full text-xs space-y-2 h-96 overflow-y-auto">
      {incomingFleets.length === 0 && (
        <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
          <p className="opacity-50">NO INCOMING FLEETS</p>
        </div>
      )}
      {incomingFleets.length !== 0 &&
        incomingFleets.map((fleet, index) => (
          <div
            key={index}
            className="flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 "
          >
            <div className="flex gap-1 items-center">
              {fleet.type === ESendType.INVADE && (
                <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                  <BiSolidInvader size={16} />
                  <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
                    INVADE
                  </p>
                </div>
              )}
              {fleet.type === ESendType.REINFORCE && (
                <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
                  <FaShieldAlt size={16} />
                  <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
                    REINFORCE
                  </p>
                </div>
              )}
              <LabeledValue label="ORIGIN">
                <p>
                  [{fleet.target.x}, {fleet.target.y}]
                </p>
              </LabeledValue>
            </div>
            <div className="text-right">
              <LabeledValue label="ETA">
                <div className="flex gap-1">
                  <p>{fleet.arrivalTime - (blockNumber ?? 0)}</p>
                  <span className="opacity-50">BLOCKS</span>
                </div>
              </LabeledValue>
            </div>
          </div>
        ))}
    </div>
  );
};
