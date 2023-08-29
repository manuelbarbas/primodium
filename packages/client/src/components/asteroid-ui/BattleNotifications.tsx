import React from "react";
import { FaTimes, FaTrophy } from "react-icons/fa";
import {
  Battle,
  NotificationQueue,
} from "src/network/components/clientComponents";

const BattleNotifications: React.FC = () => {
  const notifications = NotificationQueue.use();
  if (!notifications) return null;
  console.log("notifications", notifications);

  return (
    <div className="fixed bottom-8 left-8 z-50 p-4">
      <ul className="space-y-2">
        {notifications.id.map((id, index) => {
          if (index > 10) return null;
          const battle = Battle.get(id);
          console.log("battle:", battle);
          const icon =
            notifications.status[index] == "winner" ? (
              <FaTrophy size={24} />
            ) : (
              <FaTimes size={24} />
            );
          const message = notifications.message[index];
          const timestamp = notifications.timestamp[index];
          return (
            <li
              key={`${id}-${index}`}
              className="bg-white rounded shadow-md p-3 w-64 text-black"
            >
              <div className="flex items-center">
                <div className="mr-2">{icon}</div>
                <div>
                  <span className="block font-bold">{message}</span>
                  <span className="text-xs text-gray-600">{timestamp}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BattleNotifications;
