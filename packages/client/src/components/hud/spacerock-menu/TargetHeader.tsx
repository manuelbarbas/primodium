import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getAsteroidImage, getSpaceRockName } from "src/util/asteroid";
import { EntityType, ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";
import { UtilityLabel } from "./widgets/resources/utilities/UtilityLabel";
export const TargetHeader = ({
  entity,
  hideStats,
  showHousing,
}: {
  entity?: Entity;
  hideStats?: boolean;
  showHousing?: boolean;
}) => {
  const selectedSpacerock = entity ?? components.SelectedRock.use()?.value;
  const primodium = usePrimodium();
  const coord = components.Position.use(selectedSpacerock ?? singletonEntity) ?? { x: 0, y: 0 };
  const { strength } = useAsteroidStrength(selectedSpacerock ?? singletonEntity);
  const owner = components.OwnedBy.use(selectedSpacerock)?.value;
  if (!selectedSpacerock) return null;
  const img = getAsteroidImage(primodium, selectedSpacerock) ?? "";
  const name = getSpaceRockName(selectedSpacerock);

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* <p className="text-xs font-bold opacity-75 pb-1">TARGET</p> */}
      <Badge className="w-full uppercase font-bold text-sm items-center flex flex-col h-fit">
        <IconLabel imageUri={img ?? ""} className="" text={`${name}`} />
      </Badge>
      {!hideStats && (
        <div className="grid grid-cols-3 gap-1">
          <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
            <p className="scale-95 opacity-50">
              {coord.x}, {coord.y}
            </p>
          </Badge>
          <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
            <IconLabel imageUri={ResourceImage.get(EntityType.Defense) ?? ""} text={``} className="w-4 h-4" />
            <p className="scale-95 opacity-50">
              {formatResourceCount(EntityType.Iron, strength, { short: true, fractionDigits: 2 })}
            </p>
            {showHousing && (
              <UtilityLabel spaceRock={selectedSpacerock} name="Housing" resourceId={EntityType.Housing} size="xs" />
            )}
          </Badge>
          <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
            {owner ? (
              <AccountDisplay player={owner as Entity} className={`opacity-70 scale-95`} />
            ) : (
              <p className="opacity-50 scale-95">NEUTRAL</p>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
};
