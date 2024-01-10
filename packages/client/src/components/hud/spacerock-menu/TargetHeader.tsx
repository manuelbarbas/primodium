import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { formatNumber } from "src/util/common";
import { EntityType, ResourceImage } from "src/util/constants";
import { getRockDefense } from "src/util/defense";
import { getSpaceRockImage, getSpaceRockName } from "src/util/spacerock";
export const TargetHeader = ({ hideStats }: { hideStats?: boolean }) => {
  const selectedSpacerock = components.SelectedRock.use()?.value;
  const primodium = usePrimodium();
  const coord = components.Position.use(selectedSpacerock ?? singletonEntity) ?? { x: 0, y: 0 };
  const def = getRockDefense(selectedSpacerock ?? singletonEntity);
  const owner = components.OwnedBy.use(selectedSpacerock)?.value;
  if (!selectedSpacerock) return null;
  const img = getSpaceRockImage(primodium, selectedSpacerock);
  const name = getSpaceRockName(selectedSpacerock);

  return (
    <div className="flex flex-col gap-1">
      {/* <p className="text-xs font-bold opacity-75 pb-1">TARGET</p> */}
      <Badge className="w-full uppercase font-bold text-sm items-center flex flex-col h-fit">
        <IconLabel imageUri={img} className="" text={`${name}`} />
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
            <p className="scale-95 opacity-50">{formatNumber(def.points, { short: true, fractionDigits: 2 })}</p>
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
