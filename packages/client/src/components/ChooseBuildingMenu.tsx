import { useState } from "react";

function ChooseBuildingMenu({ title }: { title: string }) {
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
      <div className="z-[1000] fixed bottom-0 w-11/12 h-72 flex flex-col bg-gray-700 text-white font-mono rounded">
        <p className="mt-4 text-lg font-bold mb-3">{title}</p>
        <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
          <button className="w-16 h-16 text-xs">
            <img src="https://mindustrygame.github.io/wiki/images/block-surge-smelter-ui.png"></img>
          </button>
        </div>
        <button
          onClick={minimizeBox}
          className="absolute bottom-4 text-center right-0 h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
        >
          <p className="inline-block">Return to menu</p>
        </button>
      </div>
    );
  } else {
    return <div></div>;
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default ChooseBuildingMenu;
