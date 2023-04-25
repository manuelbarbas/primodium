import TechTreeItem from "./TechTreeItem";

function ResearchPage() {
  return (
    <div className="mx-5 mt-3 overflow-y-scroll scrollbar inset-y-3">
      <div className="mb-3 font-bold">Resource mining</div>{" "}
      <div className="flex">
        <TechTreeItem
          icon={"../img/building/minerdrill.gif"}
          name={"Precision pneumatic drill"}
          description={"test tree"}
          resourcecost={"pp"}
        />
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
