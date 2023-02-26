import MarketResource from "./MarketResource";
import { FaHistory } from "react-icons/fa";

function AllResourcesPage() {
  return (
    <div className="mt-4 rounded">
      <div className="grid grid-cols-4 h-72 overflow-y-scroll scrollbar">
        <MarketResource
          resourceName={"Primodium"}
          resourceThumbnail={
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
          }
          resourceType={"precious"}
        />
        <MarketResource
          resourceName={"Bolutite"}
          resourceThumbnail={
            "https://static.wikia.nocookie.net/gensin-impact/images/2/22/Item_Acquaint_Fate.png"
          }
          resourceType={"epic"}
        />
        <MarketResource
          resourceName={"Kimberlite"}
          resourceThumbnail={
            "https://static.wikia.nocookie.net/gensin-impact/images/4/44/Item_Genesis_Crystal.png"
          }
          resourceType={"epic"}
        />
        <MarketResource
          resourceName={"Osmium"}
          resourceThumbnail={
            "https://mindustrygame.github.io/wiki/images/item-graphite.png"
          }
          resourceType={"rare"}
        />
        <MarketResource
          resourceName={"Titanium"}
          resourceThumbnail={
            "https://mindustrygame.github.io/wiki/images/item-titanium.png"
          }
          resourceType={"uncommon"}
        />
        <MarketResource
          resourceName={"Copper"}
          resourceThumbnail={
            "https://mindustrygame.github.io/wiki/images/item-copper.png"
          }
          resourceType={"common"}
        />
      </div>
      {/* todo: page for prev listings and historical transactions */}
      <button className="fixed bottom-5 right-5 rounded flex items-center space-x-2">
        <FaHistory />
        <span>Your listings</span>
      </button>
    </div>
  );
}

export default AllResourcesPage;
