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
      className="z-[1000] bg-black bg-opacity-75 fixed inset-0"
      onClick={hideModalHelper}
    >
      <div className="flex justify-center items-center h-full">
        <div
          className="z-[1000] fixed inset-y-24 inset-x-24 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded"
          onClick={stopPropagation}
        >
          <div className="flex flex-col h-full relative">
            <button
              onClick={hideModalHelper}
              className="absolute top-4 right-5"
            >
              <LinkIcon icon={<FaWindowClose size="24" />} />
            </button>
            <p className="text-lg font-bold mt-4 mx-5">Resource Market</p>
            <p className="mt-2 mx-5">Coming soon!</p>
            {/* <TechTree /> */}
            {/* <AllResourcesPage /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default MarketModal;
