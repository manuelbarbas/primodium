import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { useGame } from "@/hooks/useGame";

export const BuildingImageFromType: React.FC<{ buildingType: Entity; blurred?: boolean; isBlueprint?: boolean }> = ({
  buildingType,
  blurred,
  isBlueprint = false,
}) => {
  const game = useGame();
  const imageUri = useMemo(() => game.ASTEROID.sprite.getBuildingSprite(buildingType, 1n), [game, buildingType]);

  const divClassName = isBlueprint
    ? "flex flex-col place-items-center cursor-pointer w-[110%]"
    : "relative flex flex-col items-center cursor-pointer h-11";

  const imgClassName = `pointer-events-none pixel-images rounded-md ${blurred ? "darken-[3px]" : ""} ${
    isBlueprint ? "-mt-4 -ml-1" : "absolute bottom-0 w-[1em]"
  }`;

  return (
    <div className={divClassName}>
      <img src={imageUri} className={imgClassName} />
    </div>
  );
};
