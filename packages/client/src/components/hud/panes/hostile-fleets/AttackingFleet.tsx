import { EntityID, ComponentValue } from "@latticexyz/recs";
import { BiSolidInvader } from "react-icons/bi";
import { Arrival, Position } from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";
import { shortenAddress } from "src/util/common";
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

export const AttackingFleet: React.FC<{
  spaceRock: EntityID;
  fleet: ComponentValue<typeof Arrival.schema>;
}> = ({ fleet, spaceRock }) => {
  const { sendType, destination, arrivalBlock } = fleet;
  const blockNumber = BlockNumber.use()?.value ?? 0;

  const coord = Position.use(destination);

  const isHomeAsteroid = spaceRock === destination;

  const arrived = blockNumber >= Number(arrivalBlock);

  return (
    <div
      className={`flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 ${
        isHomeAsteroid ? "border-cyan-700" : "border-slate-700"
      } `}
    >
      <div className="flex gap-1 items-center">
        <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
          <BiSolidInvader size={16} />
          <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
            {sendType === ESendType.INVADE && "INVADE"}
            {sendType === ESendType.RAID && "RAID"}
          </p>
        </div>
        <LabeledValue label="TARGET">
          {coord && !isHomeAsteroid && (
            <p>
              [{coord.x},{coord.y}]
            </p>
          )}
          {isHomeAsteroid && <p>HOME</p>}
        </LabeledValue>
      </div>
      <div className="text-right">
        {arrived && (
          <LabeledValue label="ATTACKER">
            <div className="flex gap-1 text-right w-full">
              <p className="w-full">{shortenAddress(fleet.from)}</p>
            </div>
          </LabeledValue>
        )}
        {!arrived && (
          <LabeledValue label="ETA">
            <div className="flex gap-1 text-right w-full">
              <p className="w-full">
                {Math.max(Number(arrivalBlock) - blockNumber, 0)} BLOCKS
              </p>
            </div>
          </LabeledValue>
        )}
      </div>
    </div>
  );
};
