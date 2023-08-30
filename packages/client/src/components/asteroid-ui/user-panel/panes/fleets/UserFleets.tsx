import { ComponentValue, EntityID } from "@latticexyz/recs";
import {
  Arrival,
  OwnedBy,
  Position,
} from "src/network/components/chainComponents";
import { Account, BlockNumber } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";
import { BiSolidInvader } from "react-icons/bi";
import { FaAngleDoubleLeft } from "react-icons/fa";
import { SingletonID } from "@latticexyz/network";
import { useGameStore } from "src/store/GameStore";
import { invade, raid, recall } from "src/util/web3";
import { useMud } from "src/hooks/useMud";

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

export const OrbitActionButton: React.FC<{
  destination: EntityID;
  sendType: ESendType;
}> = ({ destination, sendType }) => {
  const network = useMud();
  const destinationOwner = OwnedBy.use(destination)?.value;
  const player = Account.use()?.value ?? SingletonID;
  const transactionLoading = useGameStore((state) => state.transactionLoading);

  const isFriendly = destinationOwner === player || !destinationOwner;

  return (
    <div className="flex w-12 gap-1">
      <button
        disabled={transactionLoading}
        className={`border p-1 w-full rounded-md hover:scale-105 transition-all ${
          isFriendly
            ? "bg-cyan-700 border-cyan-500"
            : "bg-rose-800 border-rose-600"
        } ${transactionLoading ? "opacity-50 pointer-events-none" : ""} `}
        onClick={() => {
          switch (sendType) {
            case ESendType.INVADE:
              invade(destination, network);
              return;
            case ESendType.RAID:
              raid(destination, network);
              return;
          }
        }}
      >
        {isFriendly ? "LAND" : "ATTACK"}
      </button>
      {/* <button
        disabled={transactionLoading}
        onClick={() => {
          recall(destination, network);
        }}
        className={`bg-slate-700 border rounded-md border-slate-500 px-1 hover:scale-105 transition-all ${
          transactionLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <FaAngleDoubleLeft />
      </button> */}
    </div>
  );
};

export const UserFleets: React.FC<{ user: EntityID }> = ({ user }) => {
  const fleets = Arrival.use({
    from: user,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">NO OUTGOING FLEETS</p>
        </div>
      ) : (
        fleets.map((fleet, i) => {
          if (!fleet) return null;
          return <Fleet key={i} fleet={fleet} />;
        })
      )}
    </div>
  );
};

const Fleet = ({
  fleet,
}: {
  fleet: ComponentValue<typeof Arrival.schema>;
  showOrigin?: boolean;
  showDestination?: boolean;
}) => {
  const blockNumber = BlockNumber.use()?.value;

  const destinationPosition = Position.use(fleet.destination, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const arrivalTime = Number(fleet.arrivalBlock) - (blockNumber ?? 0);

  //reinforce fleets are shown in external fleet reports
  if (fleet.sendType === ESendType.REINFORCE) return;

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
        {fleet.sendType === ESendType.RAID && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
              RAID
            </p>
          </div>
        )}
        <LabeledValue label={`${arrivalTime > 0 ? "IN-TRANSIT" : "ORBITING"}`}>
          <p>
            [{destinationPosition.x}, {destinationPosition.y}]
          </p>
        </LabeledValue>
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
          <OrbitActionButton
            destination={fleet.destination}
            sendType={fleet.sendType}
          />
        )}
      </div>
    </div>
  );
};
