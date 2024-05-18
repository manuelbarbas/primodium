import { SecondaryCard } from "src/components/core/Card";
import { Loader } from "src/components/core/Loader";

export const LoadingScreen = () => {
  return (
    <div className="lex flex-col !items-start justify-between w-full h-full text-sm pointer-events-auto">
      <SecondaryCard className="w-full h-full flex-grow items-center justify-center font-bold opacity-50">
        <Loader />
        LOADING LEADERBOARD DATA
      </SecondaryCard>
    </div>
  );
};
