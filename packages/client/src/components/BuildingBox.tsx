import BuildingButton from "./BuildingButton";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { BsArrowRightSquareFill } from "react-icons/bs";
import { MdLocalFireDepartment } from "react-icons/md";
import { useState } from "react";

function BuildingBox() {
  const [page, setPage] = useState(0);
  const maxPage = 2;
  const pageName = ["Mining", "Power", "Defense"];

  const pageForward = () => {
    if (page === maxPage) {
      setPage(0);
    } else {
      setPage(page + 1);
    }
  };

  const pageBackward = () => {
    if (page === 0) {
      setPage(maxPage);
    } else {
      setPage(page - 1);
    }
  };
  function BuildingPage() {
    if (page === 0) {
      return (
        <div className="grid grid-cols-5 gap-1.5 h-36 overflow-y-scroll scrollbar">
          <BuildingButton />
          <BuildingButton />
          <BuildingButton />
        </div>
      );
    } else if (page === 1) {
      return (
        <div className="grid grid-cols-5 gap-1.5 h-36 overflow-y-scroll scrollbar">
          <BuildingButton />
          <BuildingButton />
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-5 gap-1.5 h-36 overflow-y-scroll scrollbar">
          <BuildingButton />
        </div>
      );
    }
  }

  return (
    <div className="z-[1000] fixed bottom-4 left-4 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className=" mt-4 ml-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Building Menu</p>
        <BuildingPage />
        <div className="absolute bottom-4 left-5 h-10 text-sm font-bold flex">
          <button className="hover:text-gray-200" onClick={pageBackward}>
            <LinkIcon icon={<BsArrowLeftSquareFill size="24" />} />
          </button>
          <div className="inline-block my-auto ml-3 mr-3 w-24 text-center">
            {pageName[page]}
          </div>
          <button className="hover:text-gray-200" onClick={pageForward}>
            <LinkIcon icon={<BsArrowRightSquareFill size="24" />} />
          </button>
        </div>
        <button className="absolute bottom-4 right-4 h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm">
          <p className="inline-block ml-1">Toggle destroy</p>
        </button>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default BuildingBox;
