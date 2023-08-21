import { ResearchTree } from "../../../util/research";
import { ResearchItem } from "./ResearchItem";
import { UpgradeRangeItem } from "./UpgradeRangeItem";

function ResearchPage() {
  return (
    <div className="text-md text-white font-bold space-y-2">
      <UpgradeRangeItem />
      {ResearchTree.map(({ category, data }) => {
        return (
          <div
            key={category}
            className="text-md text-white font-bold space-y-2 pt-2"
          >
            <h1 className="text-xl bg-cyan-700 px-2 py-2 border rounded-md border-cyan-300 w-fit bg-gradient-to-b from-transparent to-cyan-900/30">
              {category}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
              {data.map((item) => {
                return <ResearchItem key={item.id} data={item} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResearchPage;
