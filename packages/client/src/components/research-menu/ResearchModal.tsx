import { useState } from "react";

import { FaWindowClose } from "react-icons/fa";
import TechTree from "./TechTree";
import ResearchPage from "./ResearchPage";

function ResearchModal() {
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
      <div className="z-[999] bg-black bg-opacity-75 fixed inset-0 flex">
        <div className="z-[1000] fixed inset-y-24 inset-x-48 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
          <div className=" flex flex-col h-full">
            <button onClick={minimizeBox} className="fixed top-4 right-5">
              <LinkIcon icon={<FaWindowClose size="24" />} />
            </button>
            <p className="text-lg font-bold mt-4 ml-5  ">
              Research technologies
            </p>
            {/* <TechTree /> */}
            <ResearchPage />
          </div>
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

export default ResearchModal;
