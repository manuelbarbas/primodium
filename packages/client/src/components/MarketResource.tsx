import { useState } from "react";

function MarketResource({
  resourceName,
  resourceThumbnail,
}: {
  resourceName: string;
  resourceThumbnail: string;
}) {
  const [marketTab, setMarketTab] = useState(false);

  const openTab = () => {
    setMarketTab(true);
  };

  if (marketTab) {
    return (
      <div className="absolute inset-y-24 inset-x-4 w-auto h-80 bg-black"></div>
    );
  } else {
    return (
      <div className="w-20 col-auto h-32 justify-center inline-block">
        <button onClick={openTab}>
          <div className="mt-4 w-20 h-20 flex items-center justify-center border-solid border-2 border-gray-600 bg-amber-300 rounded">
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
export default MarketResource;
