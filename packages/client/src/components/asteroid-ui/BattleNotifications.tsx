import { ComponentValue, EntityID } from "@latticexyz/recs";
import React from "react";
import { FaGreaterThan, FaTimes, FaTrophy } from "react-icons/fa";
import {
  Account,
  Battle,
  BattleReport,
  NotificationQueue,
} from "src/network/components/clientComponents";
import { shortenAddress } from "src/util/common";
const BattleNotifications: React.FC = () => {
  const notifications = NotificationQueue.use();
  if (!notifications) return null;

  return (
    <div className="fixed bottom-8 left-8 z-50 p-4 w-96 flex flex-col gap-4">
      {notifications.id.map((id, index) => {
        const battle = Battle.get(id);
        if (battle == undefined || index > 6) return null;
        const notification = {
          id: id,
          timestamp: notifications.timestamp[index],
        };
        return (
          <BattleNotification
            id={id}
            battle={battle}
            key={`${notification.id}-${index}`}
          />
        );
      })}
    </div>
  );
};

const BattleNotification: React.FC<{
  id: EntityID;
  battle: ComponentValue<typeof Battle.schema>;
}> = ({ battle, id }) => {
  const player = Account.use()?.value;

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
export default BattleNotifications;
