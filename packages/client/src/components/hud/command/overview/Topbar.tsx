import { HUD } from "@/components/core/HUD";

const AsteroidSelector = () => {
  return <div>Asteroid Selector</div>;
};

const FleetSelector = () => {
  return <div>Fleet Selector</div>;
};

export const TopBar = () => {
  return (
    <HUD.TopMiddle className="mt-36 flex flex-col items-center">
      <AsteroidSelector />
      <FleetSelector />
    </HUD.TopMiddle>
  );
};
