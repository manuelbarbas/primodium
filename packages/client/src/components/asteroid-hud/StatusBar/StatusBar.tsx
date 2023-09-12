import { SecondaryCard } from "../../core/Card";
import { Resources } from "./Resources";

export const StatusBar: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-1">
      <Resources />
      <SecondaryCard className="w-fit">Leaderboard</SecondaryCard>
    </div>
  );
};
