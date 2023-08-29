import React from "react";
import { NotificationQueue } from "src/network/components/clientComponents";

const BattleNotifications: React.FC = () => {
  const notifications = NotificationQueue.use();
  if (!notifications) return null;
  console.log("notifications", notifications);

  return (
    <div className="fixed bottom-8 left-8 z-50 p-4">
      <ul className="space-y-2">
        {notifications.id.map((id, index) => {
          const icon = notifications.icon[index];
          const message = notifications.message[index];
          const timestamp = notifications.timestamp[index];
          if (index > 10) return null;
          return (
            <li
              key={`${id}-${index}`}
              className="bg-white rounded shadow-md p-3 w-64 text-black"
            >
              <div className="flex items-center">
                <div className="mr-2">
                  <img src={icon} alt="icon" className="w-5 h-5" />
                </div>
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
