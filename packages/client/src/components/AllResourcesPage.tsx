import PrimodiumBalance from "./PrimodiumBalance";
import MarketResource from "./MarketResource";

function AllResourcesPage() {
  return (
    <div className="mt-4 rounded">
      <PrimodiumBalance balance={2000000} />
      <div className="grid grid-cols-4 h-80 overflow-y-scroll scrollbar">
        <MarketResource
          resourceName={"Primodium"}
          resourceThumbnail={
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
          }
        />
      </div>
    </div>
  );
}

export default AllResourcesPage;
