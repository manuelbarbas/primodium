import { primodium } from "@game/api";
import { BeltMap } from "@game/constants";
import { useEffect } from "react";

type StarmapViewProps = {
  id: string;
};

export const Starmap: React.FC<StarmapViewProps> = ({ id }) => {
  const { setTarget } = primodium.api(BeltMap.KEY)!.game;

  useEffect(() => {
    setTarget(id);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div
        style={{
          backgroundSize: `75px 75px`,
          opacity: 0.2,
          backgroundImage: "url(/img/backgrounds/star.webp)",
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Tile Background */}
      <div id={id} className="w-full h-full" />
    </div>
  );
};
