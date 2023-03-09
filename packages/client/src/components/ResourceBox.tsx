import { useState } from "react";

import { FaMinusSquare } from "react-icons/fa";
import { FaPlusSquare } from "react-icons/fa";
import { useMud } from "../context/MudContext";

import ResourceLabel from "./ResourceLabel";

function ResourceBox() {
  const { components } = useMud();

  const [minimized, setMinimize] = useState(true);
  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  if (!minimized) {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-64 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Resources</p>
          <div className="h-64 overflow-y-scroll scrollbar">
            <ResourceLabel
              name={"Bolutite"}
              resourceComponent={components.BolutiteResource}
            />
            <ResourceLabel
              name={"Copper"}
              resourceComponent={components.CopperResource}
            />
            <ResourceLabel
              name={"Iridium"}
              resourceComponent={components.IridiumResource}
            />
            <ResourceLabel
              name={"Iron"}
              resourceComponent={components.IronResource}
            />
            <ResourceLabel
              name={"Kimberlite"}
              resourceComponent={components.KimberliteResource}
            />
            <ResourceLabel
              name={"Lithium"}
              resourceComponent={components.LithiumResource}
            />
            <ResourceLabel
              name={"Osmium"}
              resourceComponent={components.OsmiumResource}
            />
            <ResourceLabel
              name={"Tungsten"}
              resourceComponent={components.TungstenResource}
            />
            <ResourceLabel
              name={"Uraninite"}
              resourceComponent={components.UraniniteResource}
            />
            <ResourceLabel
              name={"Bullet"}
              resourceComponent={components.BulletCrafted}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaPlusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Resources</p>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default ResourceBox;
