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
          <PrimodiumBalance balance={2000000} />
          <div className="grid grid-cols-4 h-72 overflow-y-scroll scrollbar">
            <div className="w-20 col-auto h-32 justify-center inline-block">
              <div className="mt-4 w-20 h-20 flex items-center justify-center border-solid border-2 border-gray-600 bg-amber-300 rounded">
                <img
                  className="w-12 h-12 inline-block"
                  src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
                />
              </div>
              <div className="flex justify-center text-sm mt-2">
                <div>Primodium</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 2 && (
        <div className="mt-4 rounded">
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
