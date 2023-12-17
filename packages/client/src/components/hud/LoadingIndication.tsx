import { Loader } from "../core/Loader";
import { components } from "src/network/components";
import { FaDatabase } from "react-icons/fa";

export const LoadingIndication = () => {
  const queueSize = components.TransactionQueue.useSize();

  if (!queueSize) return <></>;

  return (
    <div className="flex flex-col items-start justify-center mt-2 space-y-1 ml-2">
      <p className="text-sm text-accent font-bold flex items-center gap-2">
        <Loader /> TRANSACTION IN PROGRESS
      </p>
      {queueSize > 1 && (
        <p className="text-xs text-secondary font-bold flex items-center gap-2 pl-8">
          <FaDatabase /> {queueSize - 1} IN QUEUE
        </p>
      )}
    </div>
  );
};
