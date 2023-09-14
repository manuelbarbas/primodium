import { FaMapPin } from "react-icons/fa";

export const CurrentObjective = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-2 space-y-1 drop-shadow-2xl">
      <p className="text-sm text-accent font-bold flex items-center gap-2">
        <FaMapPin /> CURRENT OBJECTIVE
      </p>
      <p className="text-xs opacity-75">Mine 100 Iron</p>
    </div>
  );
};
