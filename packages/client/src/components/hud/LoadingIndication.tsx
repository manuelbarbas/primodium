// import { FaMapPin } from "react-icons/fa";

import { useGameStore } from "src/store/GameStore";
import { Loader } from "../core/Loader";

export const LoadingIndication = () => {
  const transactionLoading = useGameStore((state) => state.transactionLoading);

  if (!transactionLoading) return <></>;

  return (
    <div className="flex flex-col items-start justify-center mt-2 space-y-1 drop-shadow-2xl ml-2">
      <p className="text-sm text-accent font-bold flex items-center gap-2">
        <Loader /> TRANSACTION IN PROGRESS
      </p>
    </div>
  );
};
