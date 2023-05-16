import { useCallback } from "react";
import { FaWindowClose } from "react-icons/fa";
import ResearchPage from "./ResearchPage";

function ResearchModal({
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
      className="z-[1000] bg-black bg-opacity-75 fixed inset-0 flex"
      onClick={hideModalHelper}
    >
      <div
        className="z-[1000] fixed inset-y-24 inset-x-32 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded"
        onClick={stopPropagation}
      >
        <div className=" flex flex-col h-full">
          <button onClick={hideModalHelper} className="fixed top-4 right-5">
            <LinkIcon icon={<FaWindowClose size="24" />} />
          </button>
          <p className="text-lg font-bold mt-4 ml-5 ">Research Technologies</p>
          {/* <TechTree /> */}
          <ResearchPage />
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block align-middle">{icon}</div>
);

export default ResearchModal;
