import TechTreeItem from "./TechTreeItem";
import { technologyTree } from "../../util/research";
import { ResearchImage } from "../../util/constants";

function ResearchPage() {
  return (
    <div className="mx-5 mt-3 overflow-y-scroll scrollbar inset-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
        {technologyTree.map((item) => {
          const resourceIcon = ResearchImage.get(item.data.id);
          return (
            <TechTreeItem
              data={item.data}
              key={item.data.id}
              icon={resourceIcon}
              name={item.data.name}
              description={item.data.description ? item.data.description : ""}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ResearchPage;
