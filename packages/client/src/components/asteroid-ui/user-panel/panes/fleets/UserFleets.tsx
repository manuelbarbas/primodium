import {
  ComponentValue,
  EntityID,
  getEntitiesWithValue,
} from "@latticexyz/recs";
import {
  Arrival,
  OwnedBy,
  Position,
} from "src/network/components/chainComponents";
import { Account, BlockNumber } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";
import { BiSolidInvader } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { SingletonID } from "@latticexyz/network";
import { useGameStore } from "src/store/GameStore";
import { invade, raid, recall, reinforce } from "src/util/web3";
import { useMud } from "src/hooks/useMud";
import { useState } from "react";

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

  const isNeutral = destinationOwner === player || !destinationOwner;

  return (
    <div className="flex w-12 gap-1">
      <button
        disabled={transactionLoading}
        className={`border p-1 w-full rounded-md hover:scale-105 transition-all ${
          isNeutral || sendType === ESendType.REINFORCE
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
            case ESendType.REINFORCE:
              if (isNeutral) {
                recall(destination, network);
                return;
              }

              const arrivalEntity = getEntitiesWithValue(Arrival, {
                destination,
                sendType: ESendType.REINFORCE,
              })
                .entries()
                .next().value[0] as EntityID | undefined;

              if (arrivalEntity === undefined) return;

              const arrivalIndex = Arrival.getAll().indexOf(arrivalEntity);

              reinforce(destination, arrivalIndex, network);
          }
        }}
      >
        {isNeutral && (sendType === ESendType.REINFORCE ? "RECALL" : "LAND")}
        {!isNeutral && (sendType === ESendType.REINFORCE ? "ACCEPT" : "ATTACK")}
      </button>
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
        {fleet.sendType === ESendType.REINFORCE && (
          <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <FaShieldAlt size={16} />
            <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
              REINFORCE
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

export const Outgoingfleets: React.FC<{ user: EntityID }> = ({ user }) => {
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

export const Reinforcementfleets: React.FC<{ user: EntityID }> = ({ user }) => {
  const fleets = Arrival.use({
    to: user,
    sendType: ESendType.REINFORCE,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">NO REINFORCEMENT FLEETS</p>
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

export const UserFleets: React.FC<{ user: EntityID }> = ({ user }) => {
  const [index, setIndex] = useState<number>(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex items-center justify-center gap-2">
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 0 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(0)}
        >
          Outgoing
        </button>
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 1 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(1)}
        >
          Reinforcements
        </button>
      </div>

      {index === 0 && <Outgoingfleets user={user} />}
      {index === 1 && <Reinforcementfleets user={user} />}
    </div>
  );
};
