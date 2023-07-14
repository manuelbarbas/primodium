import { useComponentValue } from "@latticexyz/react";
import { EntityIndex } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { useMud } from "src/context/MudContext";
import { world } from "src/network/world";
import { useGameStore } from "src/store/GameStore";
import {
  BackgroundImage,
  BlockIdToKey,
  ResourceImage,
} from "src/util/constants";
import { getBuildingMaxHealth } from "src/util/health";
import {
  CraftRecipe,
  isClaimable,
  isClaimableFactory,
  isMainBase,
} from "src/util/resource";
import { getTopLayerKeyPair } from "src/util/tile";
import ClaimButton from "../action/ClaimButton";
import ClaimCraftButton from "../action/ClaimCraftButton";
import UpgradeButton from "../action/UpgradeButton";
import AllResourceLabels from "../resource-box/AllResourceLabels";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";

type Props = { building: EntityIndex; minimized: boolean };
const SelectedBuilding: React.FC<Props> = ({ building, minimized }) => {
  const { components, perlin } = useMud();
  const owner = useComponentValue(components.OwnedBy, building)?.value;

  const buildingEntity = world.entities[building];
  const position = useComponentValue(components.Position, building);
  const terrain = position ? getTopLayerKeyPair(position, perlin) : undefined;

  const claimable = isClaimable(buildingEntity);
  const claimableFactory = isClaimableFactory(buildingEntity);
  const tileHealth = useComponentValue(components.Health, building);

  const CraftRecipeDisplay = () => {
    if (!isClaimableFactory(buildingEntity)) return null;

    const craftRecipe = CraftRecipe.get(buildingEntity);
    if (!craftRecipe) return null;
    return (
      <p>
        {craftRecipe[0].resources.map((item) => {
          return (
            <ResourceIconTooltip
              key={BlockIdToKey[item.id]}
              image={ResourceImage.get(item.id)!}
              name={BlockIdToKey[item.id]}
              resourceId={item.id}
              amount={item.amount}
              inline
            />
          );
        })}
        <ResourceIconTooltip
          name={BlockIdToKey[craftRecipe[0].id]}
          image={ResourceImage.get(craftRecipe[0].id)!}
          resourceId={craftRecipe[0].id}
          amount={1}
          inline
        />
      </p>
    );
  };

  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  const name = "building";
  if (minimized)
    return (
      <div>
        {name} <p className="italic">{owner}</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-1.5 overflow-y-scroll scrollbar">
      <div className="flex flex-col">
        <div className="flex align-center mb-4">
          <div
            className="inline-block w-16 h-16 flex-shrink-0"
            style={{
              backgroundImage: `url(${BackgroundImage.get(buildingEntity)!})`,
              backgroundSize: "cover",
              imageRendering: "pixelated",
            }}
          ></div>
          <div className="ml-4 mb-1 flex flex-col my-auto">
            <b>{name}</b>
            <br />
            {terrain?.resource && (
              <>
                <img
                  className="inline-block mr-2"
                  src={BackgroundImage.get(terrain.resource)}
                />
                {BlockIdToKey[terrain.resource]}
              </>
            )}
          </div>
        </div>
      </div>
      {owner && (
        <div className="flex-col">
          <div className="inline-block font-bold mb-1">Owner:</div>
          <div className="mx-2 inline-block">
            <div>{owner.toString().slice(0, 8) + "..."}</div>
          </div>
        </div>
      )}
      <div className="flex-col">
        <div className="inline-block font-bold mb-1">Health:</div>
        <div className="mx-2 inline-block">
          <div>
            {tileHealth
              ? BigNumber.from(tileHealth?.value).toString()
              : getBuildingMaxHealth(buildingEntity)}
            /{getBuildingMaxHealth(buildingEntity)}
          </div>
        </div>
      </div>
      <CraftRecipeDisplay />
      <div className="flex-row mt-2 mb-2">
        {(claimable || claimableFactory) && !isMainBase(buildingEntity) && (
          <div className="font-bold mb-1">Storage:</div>
        )}
        {!!position && (
          <>
            {claimable && !claimableFactory && (
              <ClaimButton
                id="claim-button"
                builtTile={buildingEntity}
                coords={position}
              />
            )}
            {claimableFactory && (
              <ClaimCraftButton
                id="claim-button-factory"
                builtTile={buildingEntity}
                coords={position}
              />
            )}
            {
              <UpgradeButton
                id="upgrade-button"
                builtTile={buildingEntity}
                coords={position}
              />
            }
          </>
        )}
        {transactionLoading ? (
          <p>...</p>
        ) : (
          <AllResourceLabels entityIndex={building} />
        )}
      </div>
    </div>
  );
};

export default SelectedBuilding;
