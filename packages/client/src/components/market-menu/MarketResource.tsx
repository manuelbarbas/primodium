import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

import PriceHistoryTable from "./PriceHistoryTable";
import ResourcePrice from "./ResourcePrice";

function MarketResource({
  resourceName,
  resourceThumbnail,
  resourceType,
}: {
  resourceName: string;
  resourceThumbnail: string;
  resourceType: string;
}) {
  const [marketTab, setMarketTab] = useState(false);

  const openTab = () => {
    setMarketTab(true);
  };

  const closeTab = () => {
    setMarketTab(false);
  };

  let bgColorClass;
  switch (resourceType) {
    case "precious":
      bgColorClass = "bg-amber-300";
      break;
    case "epic":
      bgColorClass = "bg-violet-500";
      break;
    case "rare":
      bgColorClass = "bg-sky-500";
      break;
    case "uncommon":
      bgColorClass = "bg-green-400";
      break;
    default:
      bgColorClass = "bg-gray-600";
  }

  const data = [
    { date: "1/3/22", price: 0.005, quantity: 5 },
    { date: "1/2/22", price: 0.004, quantity: 6 },
    { date: "1/1/22", price: 0.0035, quantity: 3 },
    { date: "12/31/21", price: 0.004, quantity: 7 },
    { date: "12/30/21", price: 0.001, quantity: 9 },
    { date: "12/29/21", price: 0.008, quantity: 2 },

    // Add more rows as needed
  ];

  if (marketTab) {
    return (
      <div className="absolute inset-x-4 h-80 bg-gray-700">
        <div className="flex text-3xl font-bold mt-2 mb-4">
          <div>{resourceName}</div>
        </div>
        {/* <div className="text-sm">
          A precious ore used as a universal medium-of-exchange.
        </div> */}
        <div className="flex flex-row">
          <div className="w-32">
            <div
              className={`flex w-32 h-32 items-center justify-center border-solid border-2 border-gray-600 rounded ${bgColorClass}`}
            >
              <img className="w-20 h-20 inline-block" src={resourceThumbnail} />
            </div>
            {/* todo: buy and sell buttons open up divs (like tabs; see marketpages.tsx) that allow users to input qty and price */}
            <button className="w-32 p-2 border-gray-700 border-solid border-2 text-sm rounded mt-2 bg-teal-600 font-bold">
              Buy
            </button>
            <button className="w-32 p-2 border-gray-700 border-solid border-2 text-sm rounded mt-2 bg-teal-600 font-bold">
              Sell
            </button>
          </div>
          <div className="ml-6">
            <div className="flex mb-2">Current Price:</div>
            <ResourcePrice price={0.0003} currency={"Ethereum"} />
            <PriceHistoryTable data={data} />
          </div>
        </div>
        <button className="fixed bottom-5" onClick={closeTab}>
          <LinkIcon icon={<FaArrowLeft size="18" />} /> Other Buildings
        </button>
      </div>
    );
  } else {
    return (
      <div className="w-20 col-auto h-s justify-center inline-block">
        <button onClick={openTab}>
          <div
            className={`w-20 h-20 flex items-center justify-center border-solid border-2 border-gray-600 rounded ${bgColorClass}`}
          >
            <img className="w-12 h-12 inline-block" src={resourceThumbnail} />
          </div>
          <div className="flex justify-center text-sm mt-2">
            <div>{resourceName}</div>
          </div>
        </button>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default MarketResource;
