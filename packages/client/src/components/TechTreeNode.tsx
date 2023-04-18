import { memo } from "react";
import { Handle, Position } from "reactflow";

function TechTreeNode({ data }: { data: any }) {
  return (
    <div className="w-48 px-2 py-3 shadow-md rounded-md bg-white border border-stone-400">
      <div className="flex w-48">
        <div className="flex justify-center items-center flex-shrink-0">
          {data.thumbnail}
        </div>
        <div className="ml-2 mr-1 my-auto text-gray-900 font-bold text-sm">
          {data.name}
        </div>
      </div>
      <div className="mt-2">
        {/* <div className="text-gray-500 text-xs">{data.description}</div> */}
      </div>
      <div className="mt-2 text-center text-gray-900 text-sm">{data.cost}</div>
      <button className="bg-teal-600 text-sm w-full py-2 rounded shadow mt-3 ">
        Research
      </button>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(TechTreeNode);
