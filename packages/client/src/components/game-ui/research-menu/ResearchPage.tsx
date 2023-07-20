import { ResearchImage } from "src/util/constants";
import { ResearchTree } from "../../../util/research";
import { ResearchItem } from "./ResearchItem";

function ResearchPage() {
  return (
    <div className="">
      {ResearchTree.map(({ category, data }) => {
        return (
          <div
            key={category}
            className="text-md text-white font-bold space-y-2"
          >
            <h1 className="text-xl bg-slate-900 px-2 py-2 border border-b-4  border-cyan-700 w-fit">
              {category}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
              {data.map((item) => {
                const resourceIcon = ResearchImage.get(item.id);
                return (
                  <ResearchItem key={item.id} data={item} icon={resourceIcon} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResearchPage;
