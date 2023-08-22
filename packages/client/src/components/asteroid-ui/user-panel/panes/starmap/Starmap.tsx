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
      <div className="absolute inset-0 pointer-events-none" />

      {/* Tile Background */}
      <div
        id={id}
        className="w-full h-full"
        style={{
          opacity: 1,
          backgroundImage: "url(/img/backgrounds/star.png)",
        }}
      />
    </div>
  );
};
