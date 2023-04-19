import { memo } from "react";
import { Handle, Position } from "reactflow";
import { TechnologyTreeNode } from "../../util/research";

import { BlockIdToKey, BackgroundImage } from "../../util/constants";

function TechTreeNode({ data }: { data: TechnologyTreeNode }) {
  const tileColor = BackgroundImage.get(data.data.id);
  return (
    <div className="w-48 px-2 py-3 shadow-md rounded-md bg-white border border-stone-400">
      <div className="flex w-48">
        <div className="flex justify-center items-center flex-shrink-0">
          {/* thumbnail */}
          <img
            src={`url(${tileColor!})`}
            style={{ imageRendering: "pixelated" }}
            className="w-5 h-5"
          />
        </div>
        <div className="ml-2 mr-1 my-auto text-gray-900 font-bold text-sm">
          {data.data.name}
        </div>
      </div>
      <div className="mt-2">
        {/* <div className="text-gray-500 text-xs">{Test Description}</div> */}
      </div>
      <div className="mt-2 text-center text-gray-900 text-sm">
        {data.data.resources.map((resource) => {
          const tileColor = BackgroundImage.get(resource.id);
          return (
            <span className="mr-2" key={resource.id}>
              {BlockIdToKey[resource.id]}
              <img
                src={`url(${tileColor!})`}
                className="w-4 h-4 inline-block mr-1"
              />
              {resource.amount}
            </span>
          );
        })}
      </div>
      <button className="bg-teal-600 text-sm w-full py-2 rounded shadow mt-3 ">
        Research
      </button>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(TechTreeNode);
