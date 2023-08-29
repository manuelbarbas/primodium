import { useState } from "react";
import { ComponentValue, EntityID } from "@latticexyz/recs";
import { Arrival, Position } from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";
import { BiSolidInvader } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const UserFleets: React.FC<{ user: EntityID }> = ({ user }) => {
  const [index, setIndex] = useState<number>(0);

  const incomingFleets = Arrival.use({
    to: user,
  });
  const outgoingFleets = Arrival.use({
    from: user,
  });
  const fleets = index === 0 ? incomingFleets : outgoingFleets;
  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      <div className="w-full flex items-center justify-center gap-2">
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
          Outgoing
        </button>
      </div>
      {fleets.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">
            NO {index === 0 ? "INCOMING" : "OUTGOING"} FLEETS
          </p>
        </div>
      ) : (
        fleets.map((fleet, i) => {
          if (!fleet) return null;
          return (
            <Fleet
              key={i}
              fleet={fleet}
              showOrigin={index == 0}
              showDestination={index == 1}
            />
          );
        })
      )}
    </div>
  );
};

const Fleet = ({
  fleet,
  showOrigin,
  showDestination,
}: {
  fleet: ComponentValue<typeof Arrival.schema>;
  showOrigin?: boolean;
  showDestination?: boolean;
}) => {
  const blockNumber = BlockNumber.use()?.value;
  const originPosition = Position.use(fleet.origin, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const destinationPosition = Position.use(fleet.destination, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const arrivalTime = Number(fleet.arrivalBlock) - (blockNumber ?? 0);
  return (
    <div className="flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 ">
      <div className="flex gap-1 items-center">
        {fleet.sendType === ESendType.INVADE && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
              INVADE
            </p>
          </div>
        )}
        {fleet.sendType === ESendType.REINFORCE && (
          <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <FaShieldAlt size={16} />
            <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
              REINFORCE
            </p>
          </div>
        )}
        {showOrigin && (
          <LabeledValue label="ORIGIN">
            <p>
              [{originPosition.x}, {originPosition.y}]
            </p>
          </LabeledValue>
        )}
        {showDestination && (
          <LabeledValue label="TARGET">
            <p>
              [{destinationPosition.x}, {destinationPosition.y}]
            </p>
          </LabeledValue>
        )}
      </div>
      <div className="text-right">
        {arrivalTime > 0 ? (
          <LabeledValue label="ETA">
            <div className="flex gap-1">
              <p>{arrivalTime}</p>
              <span className="opacity-50">BLOCKS</span>
            </div>
          </LabeledValue>
        ) : (
          <LabeledValue label="ORBITING"></LabeledValue>
        )}
      </div>
    </div>
  );
};
