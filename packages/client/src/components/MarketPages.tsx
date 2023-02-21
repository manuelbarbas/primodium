import { useState } from "react";

import PrimodiumBalance from "./PrimodiumBalance";

function MarketPages() {
  const [activeTab, setActiveTab] = useState(1);

  const buyTab = () => {
    setActiveTab(1);
  };

  const sellTab = () => {
    setActiveTab(2);
  };

  const historyTab = () => {
    setActiveTab(3);
  };
  return (
    <div>
      <div className="flex space-x-4">
        <button
          className={`${
            activeTab === 1
              ? "bg-teal-600 text-white text-sm font-bold"
              : "bg-gray-300 text-gray-700 text-sm font-bold"
          } w-32 py-2 h-10 rounded`}
          onClick={buyTab}
        >
          Buy Items
        </button>
        <button
          className={`${
            activeTab === 2
              ? "bg-teal-600 text-white text-sm font-bold"
              : "bg-gray-300 text-gray-700 text-sm font-bold"
          } w-32 h-10 rounded`}
          onClick={sellTab}
        >
          Sell Items
        </button>
        <button
          className={`${
            activeTab === 3
              ? "bg-teal-600 text-white text-sm font-bold"
              : "bg-gray-300 text-gray-700 text-sm font-bold"
          } w-32 h-10 rounded`}
          onClick={historyTab}
        >
          History
        </button>
      </div>
      {activeTab === 1 && (
        <div className="mt-4 rounded">
          <p>buy mode</p>
          <PrimodiumBalance balance={2000000} />
        </div>
      )}
      {activeTab === 2 && (
        <div className="mt-4 rounded">
          <p>sell mode</p>
          <PrimodiumBalance balance={100000} />
        </div>
      )}
      {activeTab === 3 && (
        <div className="mt-4 rounded">
          <p>Transaction history</p>
        </div>
      )}
    </div>
  );
}
export default MarketPages;
