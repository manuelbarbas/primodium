import TechTreeItem from "./TechTreeItem";
import { technologyTree } from "../../util/research";
import { BackgroundImage, ResearchImage } from "../../util/constants";

function ResearchPage() {
  return (
    <div className="mx-5 mt-3 overflow-y-scroll scrollbar inset-y-3">
      <div className="mb-3 font-bold">Resource mining</div>
      <div className="flex">
        {technologyTree.map((item) => {
          const resourceIcon = ResearchImage.get(item.data.id);
          const ResourceCostDisplay = item.data.resources.map((resource) => {
            const resourceImage = BackgroundImage.get(resource.id);
            return (
              <span className="mr-2" key={resource.id}>
                <img
                  src={resourceImage}
                  className="w-4 h-4 inline-block mr-1"
                />
                {resource.amount}
              </span>
            );
          });
          return (
            <TechTreeItem
              key={item.data.id}
              icon={resourceIcon}
              name={item.data.name}
              description={item.data.description ? item.data.description : ""}
              resourcecost={ResourceCostDisplay}
            />
          );
        })}
      </div>
      <div className="mb-3 font-bold">Factories</div>
      <TechTreeItem
        icon={"../img/building/minerdrill.gif"}
        name={"Precision pneumatic drill"}
        description={"test tree"}
        resourcecost={"pp"}
      />
      <div className="mb-3 font-bold">Weaponry</div>
      <TechTreeItem
        icon={"../img/building/minerdrill.gif"}
        name={"Precision pneumatic drill"}
        description={"test tree"}
        resourcecost={"pp"}
      />
    </div>
  );
}

export default ResearchPage;
