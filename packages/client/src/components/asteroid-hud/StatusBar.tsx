import { SecondaryCard } from "../core/Card";
import { ResourceBar } from "./ResourceBar";

export const StatusBar: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-1">
      <ResourceBar />
      <SecondaryCard className="w-fit">Leaderboard</SecondaryCard>
    </div>
  );
};
