import { useState } from "react";
import { FaWindowClose } from "react-icons/fa";

function MarketModal() {
  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  const [activeTab, setActiveTab] = useState(1);

  const buyTab = () => {
    setActiveTab(1);
  };

  const sellTab = () => {
    setActiveTab(2);
  };

  if (!minimized) {
    return (
      <div className="z-[999] bg-black bg-opacity-75 fixed inset-0 flex">
        <div className="z-[1000] fixed inset-y-24 inset-x-1/4 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
          <div className=" mt-4 ml-5 flex flex-col h-72">
            <button onClick={minimizeBox} className="fixed top-4 right-5">
              <LinkIcon icon={<FaWindowClose size="24" />} />
            </button>
            <p className="text-lg font-bold mb-4">Resource Market</p>
            <div>
              <div className="flex items-center space-x-4">
                <button
                  className={`${
                    activeTab === 1
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-gray-300 text-gray-700 font-bold"
                  } w-32 py-2 h-10 rounded`}
                  onClick={buyTab}
                >
                  Buy Items
                </button>
                <button
                  className={`${
                    activeTab === 2
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-gray-300 text-gray-700 font-bold"
                  } w-32 h-10 rounded`}
                  onClick={sellTab}
                >
                  Sell Items
                </button>
              </div>
              {activeTab === 1 && (
                <div className="mt-4 rounded">
                  <p>buy mode</p>
                </div>
              )}
              {activeTab === 2 && (
                <div className="mt-4 rounded">
                  <p>sell mode</p>
                </div>
              )}
            </div>
            <div className="flex">
              <div className="inline-block">
                <img
                  className="w-6 h-6 mr-3"
                  src={
                    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
                  }
                ></img>
              </div>
              <div className="inline-block my-auto">20000</div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default MarketModal;
