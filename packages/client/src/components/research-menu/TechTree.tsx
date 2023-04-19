import ReactFlow from "reactflow";
import TechTreeNode from "./TechTreeNode";
import { technologyTree, technologyTreeEdges } from "../../util/research";

import "reactflow/dist/base.css";

const nodeTypes = { techTree: TechTreeNode };
const proOptions = { hideAttribution: true };

function TechTree() {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={technologyTree}
        edges={technologyTreeEdges}
        proOptions={proOptions}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}

export default TechTree;
