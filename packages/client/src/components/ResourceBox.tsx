import { GiGoldBar } from "react-icons/gi";
import { GiCoalWagon } from "react-icons/gi";
import { GiMetalBar } from "react-icons/gi";
import { GiMetalDisc } from "react-icons/gi";

function ResourceBox() {
  return (
    <div className="z-[1000] fixed top-4 right-4 h-64 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
      <div className=" mt-4 ml-5 flex flex-col h-56">
        <p className="text-lg font-bold mb-3">Resources</p>
        <div className="h-64 overflow-y-scroll scrollbar">
          <div className="flex mb-1">
            <p className="w-24">232.2k</p>
            <LinkIcon icon={<GiGoldBar size="18" />} />
            <p className=" ml-1 my-auto">Gold</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">1,234</p>
            <LinkIcon icon={<GiCoalWagon size="18" />} />
            <p className=" ml-1 my-auto">Carbon</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">259.2m</p>
            <LinkIcon icon={<GiMetalBar size="18" />} />
            <p className=" ml-1 my-auto">Iron</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">69</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">4,200</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">1</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">69</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">69</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
          <div className="flex mb-1">
            <p className="w-24">69</p>
            <LinkIcon icon={<GiMetalDisc size="18" />} />
            <p className=" ml-1 my-auto">Copper</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default ResourceBox;
