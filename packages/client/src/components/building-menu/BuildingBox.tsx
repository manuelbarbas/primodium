import { useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import BuildingPage from "./BuildingPage";

function BuildingBox() {
  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  if (!minimized) {
    return (
      <div className="z-[1000] fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-72">
          <p className="text-lg font-bold mb-3">Construct Buildings</p>
          <button onClick={minimizeBox} className="fixed top-4 right-5">
            <LinkIcon icon={<FaWindowClose size="24" />} />
          </button>
          <BuildingPage />
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default BuildingBox;
