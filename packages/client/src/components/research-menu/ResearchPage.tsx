import TechTreeItem from "./TechTreeItem";
import { technologyTree } from "../../util/research";
import { ResearchImage, ResourceImage } from "../../util/constants";

function ResearchPage() {
  return (
    <div className="mx-5 mt-3 overflow-y-scroll scrollbar inset-y-3">
      <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
        {technologyTree.map((item) => {
          const resourceIcon = ResearchImage.get(item.data.id);
          const ResourceCostDisplay = item.data.resources.map((resource) => {
            const resourceImage = ResourceImage.get(resource.id);
            return (
              <div className="mr-2" key={resource.id}>
                <img
                  src={resourceImage}
                  className="w-4 h-4 inline-block mr-1 pixel-images"
                />
                {resource.amount}
              </div>
            );
          });
          return (
            <TechTreeItem
              data={item.data}
              key={item.data.id}
              icon={resourceIcon}
              name={item.data.name}
              description={item.data.description ? item.data.description : ""}
              resourcecost={ResourceCostDisplay}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ResearchPage;
