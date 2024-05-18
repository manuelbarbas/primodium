import { FaTimes } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";

export const ErrorScreen = () => {
  return (
    <div className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto">
      <SecondaryCard className="w-full h-full flex-grow items-center justify-center font-bold opacity-50 text-error">
        <FaTimes />
        ERROR SYNCING LEADERBOARD DATA
      </SecondaryCard>
    </div>
  );
};
