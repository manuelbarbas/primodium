import TechTreeItem from "./TechTreeItem";
import { technologyTree } from "../../util/research";
import {
  BlockIdToKey,
  ResearchImage,
  ResourceImage,
} from "../../util/constants";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";

function ResearchPage() {
  return (
    <div className="mx-5 mt-3 overflow-y-scroll scrollbar inset-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
        {technologyTree.map((item) => {
          const resourceIcon = ResearchImage.get(item.data.id);
          const ResourceCostDisplay = item.data.resources.map((resource) => {
            const resourceImage = ResourceImage.get(resource.id)!;
            const resourceName = BlockIdToKey[resource.id];
            return (
              <ResourceIconTooltip
                key={resource.id}
                image={resourceImage}
                resourceId={resource.id}
                name={resourceName}
                amount={resource.amount.toString()}
              />
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
