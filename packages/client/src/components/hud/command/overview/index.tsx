import { AsteroidStatsAndActions } from "@/components/hud/command/overview/AsteroidStatsAndActions";

export const Overview = ({ onClickCreateFleet }: { onClickCreateFleet?: () => void }) => {
  return <AsteroidStatsAndActions onClickCreateFleet={onClickCreateFleet} />;
};
