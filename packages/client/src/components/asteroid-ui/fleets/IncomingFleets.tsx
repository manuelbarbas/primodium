import { ComponentValue, EntityID } from "@latticexyz/recs";
import { BiSolidInvader } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { Arrival, Position } from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";

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

export const IncomingFleets: React.FC<{ spaceRock: EntityID }> = ({
  spaceRock,
}) => {
  const incomingFleets = Arrival.use({
    destination: spaceRock,
    onlyTransit: true,
  });
  return (
    <div className="w-full text-xs space-y-2 h-96 overflow-y-auto">
      {incomingFleets.length === 0 && (
        <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
          <p className="opacity-50">NO INCOMING FLEETS</p>
        </div>
      )}
      {incomingFleets.length !== 0 &&
        incomingFleets.map((fleet, index) => {
          if (!fleet) return null;
          return <IncomingFleet key={index} fleet={fleet} />;
        })}
    </div>
  );
};

const IncomingFleet = ({
  fleet,
}: {
  fleet: ComponentValue<typeof Arrival.schema>;
}) => {
  const blockNumber = BlockNumber.use()?.value;
  const originPosition = Position.use(fleet.origin, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
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
        <LabeledValue label="ORIGIN">
          <p>
            [{originPosition.x}, {originPosition.y}]
          </p>
        </LabeledValue>
      </div>
      <div className="text-right">
        <LabeledValue label="ETA">
          <div className="flex gap-1">
            <p>{Number(fleet.arrivalBlock) - (blockNumber ?? 0)}</p>
            <span className="opacity-50">BLOCKS</span>
          </div>
        </LabeledValue>
      </div>
    </div>
  );
};
