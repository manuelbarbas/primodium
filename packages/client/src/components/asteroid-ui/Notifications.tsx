import { EntityID } from "@latticexyz/recs";
import React from "react";
import { FaGlobe, FaGreaterThan, FaTimes, FaTrophy } from "react-icons/fa";
import { FaSpaceAwesome } from "react-icons/fa6";
import { Arrival, Position } from "src/network/components/chainComponents";
import {
  Account,
  Battle,
  BattleReport,
  BlockNumber,
  NotificationQueue,
} from "src/network/components/clientComponents";
import {
  Notification,
  NotificationType,
} from "src/network/components/customComponents/NotificationQueueComponent";
import { shortenAddress } from "src/util/common";
import { ESendType, ESendTypeToLiteral } from "src/util/web3/types";
const Notifications: React.FC = () => {
  const notifications = NotificationQueue.use();
  if (!notifications) return null;

  return (
    <div className="fixed bottom-8 left-8 z-50 p-4 w-96 flex flex-col gap-4 z-[1001]">
      {notifications.id.map((id, index) => {
        if (index > 6) return null;
        const notification: Notification = {
          id,
          timestamp: notifications.timestamp[index],
          type: notifications.type[index] as NotificationType,
        };

        if (notification.type == "battle")
          return (
            <BattleNotification id={id} key={`${notifications.id}-${index}`} />
          );
        if (notification.type == "arrival-transit") {
          return (
            <TransitNotification id={id} key={`${notifications.id}-${index}`} />
          );
        }
        if (notification.type == "arrival-orbit") {
          return (
            <OrbitingNotification
              id={id}
              key={`${notifications.id}-${index}`}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

const TransitNotification: React.FC<{
  id: EntityID;
}> = ({ id }) => {
  const player = Account.use()?.value;
  const arrival = Arrival.getWithId(id);
  const blockNumber = BlockNumber.use(undefined, { value: 0, avgBlockTime: 1 });
  if (!arrival || !player) return null;

  const timeLeft =
    (Number(arrival.arrivalBlock) - blockNumber.value) /
    blockNumber.avgBlockTime;
  if (timeLeft < 0) return null;

  const destination = Position.get(arrival.destination, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });

  const sent = arrival.from == player;
  const sender = sent ? "YOUR" : `${shortenAddress(arrival.from)}'S`;
  return (
    <button className="relative flex items-center justify-between bg-slate-800 pixel-images border border-cyan-400 p-3 rounded-md text-white">
      <div className="rounded-md bg-orange-600 gap-1 p-1 mr-2 flex flex-col items-center w-20">
        <FaSpaceAwesome size={16} />
        <p
          className={`${
            sent
              ? "bg-green-700 border border-green-400"
              : "bg-rose-700 border border-rose-400"
          }  rounded-md px-1 text-[.5rem]`}
        >
          {sent ? "SENT" : "INCOMING"}
        </p>
      </div>

      <span className="text-center text-xs uppercase font-bold">
        {sender} {ESendTypeToLiteral[arrival.sendType as ESendType]} ARRIVING AT
        [{destination.x}, {destination.y}] IN {timeLeft} SECONDS!
      </span>
    </button>
  );
};

const OrbitingNotification: React.FC<{
  id: EntityID;
}> = ({ id }) => {
  const arrival = Arrival.getWithId(id);
  if (!arrival) return null;

  const destination = Position.get(arrival.destination, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  return (
    <button className="relative flex items-center justify-between bg-slate-800 pixel-images border border-cyan-400 p-3 rounded-md text-white">
      <div className="rounded-md bg-orange-600 gap-1 p-1 mr-2 flex flex-col items-center w-20">
        <FaGlobe size={16} />
        <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
          FLEET ARRIVED
        </p>
      </div>

      <span className="text-center text-xs uppercase font-bold">
        YOUR FLEET HAS ARRIVED ON [{destination.x}, {destination.y}]!
      </span>
      <span className="text-center text-xs uppercase font-bold">
        YOU CAN {ESendTypeToLiteral[arrival.sendType as ESendType]}
      </span>
    </button>
  );
};
const BattleNotification: React.FC<{
  id: EntityID;
}> = ({ id }) => {
  const battle = Battle.get(id);

  const player = Account.use()?.value;
  if (!battle) return null;

  const winner = player === battle.winner;
  const enemy = player === battle.attacker ? battle.defender : battle.attacker;

  return (
    <button
      onClick={() => BattleReport.set({ show: true, battle: id })}
      className="relative flex items-center justify-between bg-slate-800 pixel-images border border-cyan-400 p-3 rounded-md text-white"
    >
      {battle.winner !== player && (
        <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
          <FaTimes size={16} />
          <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
            LOSS
          </p>
        </div>
      )}
      {battle.winner === player && (
        <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
          <FaTrophy size={16} />
          <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
            WIN
          </p>
        </div>
      )}

      <span className="text-center text-xs uppercase font-bold">
        You {winner ? "won" : "lost"} a
        {!battle.raidedAmount ? "n INVASION" : " RAID"} against{" "}
        {shortenAddress(enemy)}!
      </span>
      <div className="flex items-center gap-1 px-1 absolute bottom-0 right-1 text-[.6rem] border rounded-md border-cyan-800 bg-slate-700 translate-y-1/2">
        VIEW DETAILS <FaGreaterThan />
      </div>
    </button>
  );
};
export default Notifications;
