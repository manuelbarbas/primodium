import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaUser } from "react-icons/fa";
import { IconLabel } from "src/components/core/IconLabel";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useGame } from "src/hooks/useGame";
import { components } from "src/network/components";
import { getAsteroidImage, getAsteroidName } from "src/util/asteroid";
import { EntityType } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { formatResourceCount } from "src/util/number";
export const TargetHeader = ({ entity: selectedSpacerock, hideStats }: { entity: Entity; hideStats?: boolean }) => {
  const game = useGame();
  const { strength } = useAsteroidStrength(selectedSpacerock ?? singletonEntity);
  const { resourceCount: encryption } = useFullResourceCount(EntityType.Encryption, selectedSpacerock);
  const owner = components.OwnedBy.use(selectedSpacerock)?.value;
  if (!selectedSpacerock) return null;
  const img = getAsteroidImage(game, selectedSpacerock) ?? "";
  const name = entityToRockName(selectedSpacerock);
  const description = getAsteroidName(selectedSpacerock);

  return (
    <div className="flex flex-col gap-1 bg-base-100">
      <div className="flex justify-center uppercase font-bold text-sm">
        <IconLabel imageUri={img ?? ""} className="" text={`${name}`} />
      </div>
      {!hideStats && (
        <div className="flex justify-center gap-1">
          <div className="flex gap-1 uppercase font-bold text-xs bg-primary items-center p-1">{description}</div>
          <div className="flex gap-2 items-center font-bold bg-primary text-xs p-1">
            <IconLabel
              imageUri={EntityToResourceImage[EntityType.HP]}
              text={formatResourceCount(EntityType.Iron, strength, { short: true, fractionDigits: 2 })}
            />
            <IconLabel
              imageUri={EntityToResourceImage[EntityType.Encryption]}
              text={formatResourceCount(EntityType.Encryption, encryption, { short: true, fractionDigits: 2 })}
            />
          </div>
          <div className="flex gap-1 uppercase font-bold text-xs bg-primary items-center p-1">
            {owner ? (
              <>
                <FaUser className="w-3 h-3" />
                <AccountDisplay player={owner as Entity} className={`opacity-70 scale-95`} />
              </>
            ) : (
              <p className="opacity-50 scale-95">NEUTRAL</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
