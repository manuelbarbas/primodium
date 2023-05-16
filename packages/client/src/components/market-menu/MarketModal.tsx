import { useCallback } from "react";
import { FaWindowClose } from "react-icons/fa";
// import AllResourcesPage from "./AllResourcesPage";

function MarketModal({
  setMenuOpenIndex,
}: {
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const hideModalHelper = useCallback(() => {
    setMenuOpenIndex(-1);
  }, []);

  const stopPropagation = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <div
      className="z-[999] bg-black bg-opacity-75 fixed inset-0 flex"
      onClick={hideModalHelper}
    >
      <div
        className="z-[1000] fixed inset-y-24 inset-x-1/4 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded"
        onClick={stopPropagation}
      >
        <div className=" mt-4 ml-5 flex flex-col h-72">
          <button onClick={hideModalHelper} className="fixed top-4 right-5">
            <LinkIcon icon={<FaWindowClose size="24" />} />
          </button>
          <p className="text-lg font-bold mb-2">Resource Market</p>
          {/* <AllResourcesPage /> */}
          {/* <div className="my-auto mx-auto w-32 text-center"> */}
          <p className="">Coming soon!</p>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default MarketModal;
