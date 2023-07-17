import { useComponentValue } from "@latticexyz/react";
import { EntityID, EntityIndex } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { useMud } from "src/context/MudContext";
import { useAccount } from "src/hooks/useAccount";
import { world } from "src/network/world";
import { useGameStore } from "src/store/GameStore";
import {
  BackgroundImage,
  BlockIdToKey,
  BlockType,
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
import { canBeUpgraded } from "src/util/upgrade";
import ClaimButton from "../action/ClaimButton";
import ClaimCraftButton from "../action/ClaimCraftButton";
import UpgradeButton from "../action/UpgradeButton";
import AllResourceLabels from "../resource-box/AllResourceLabels";
import ResourceIconTooltip from "../shared/ResourceIconTooltip";

type Props = { building: EntityIndex; minimized: boolean };
const SelectedBuilding: React.FC<Props> = ({ building, minimized }) => {
  const { components, perlin } = useMud();
  const { address } = useAccount();
  const owner = useComponentValue(components.OwnedBy, building)?.value;
  const ownerName = !owner
    ? ""
    : owner == address
    ? "you"
    : owner.toString().slice(0, 8) + "...";

  const buildingEntity = world.entities[building];
  const buildingType = useComponentValue(components.BuildingType, building, {
    value: BlockType.Node,
  })?.value as EntityID;
  const name = BlockIdToKey[buildingType]
    .replace(/([A-Z]+)/g, " $1")
    .replace(/([A-Z][a-z])/g, " $1");

  const position = useComponentValue(components.Position, building);
  const terrain = position ? getTopLayerKeyPair(position, perlin) : undefined;

  const claimable = isClaimable(buildingType);
  const claimableFactory = isClaimableFactory(buildingType);
  const tileHealth = useComponentValue(components.Health, building);

  const CraftRecipeDisplay = () => {
    if (!isClaimableFactory(buildingType)) return null;

    const craftRecipe = CraftRecipe.get(buildingType);
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

  if (minimized)
    return (
      <div className="flex gap-1.5 text-lg font-bold mb-3 items-center">
        {name} <p className="italic text-xs">{ownerName}</p>
      </div>
    );
  if (!buildingEntity) return null;
  return (
    <div className="grid grid-cols-1 gap-1.5 overflow-y-scroll scrollbar">
      <div className="flex flex-col">
        <div className="flex align-center mb-4">
          <div
            className="inline-block w-16 h-16 flex-shrink-0"
            style={{
              backgroundImage: `url(${BackgroundImage.get(buildingType)!})`,
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
      {ownerName && (
        <div className="flex-col">
          <div className="inline-block font-bold mb-1">Owner:</div>
          <div className="mx-2 inline-block">
            <div>{ownerName}</div>
          </div>
        </div>
      )}
      <div className="flex-col">
        <div className="inline-block font-bold mb-1">Health:</div>
        <div className="mx-2 inline-block">
          <div>
            {tileHealth
              ? BigNumber.from(tileHealth?.value).toString()
              : getBuildingMaxHealth(buildingType)}
            /{getBuildingMaxHealth(buildingType)}
          </div>
        </div>
      </div>
      <CraftRecipeDisplay />
      <div className="flex-row mt-2 mb-2">
        {(claimable || claimableFactory) && !isMainBase(buildingType) && (
          <div className="font-bold mb-1">Storage:</div>
        )}
        {!!position && (
          <>
            {claimable && !claimableFactory && (
              <ClaimButton
                id="claim-button"
                builtTile={buildingType}
                coords={position}
              />
            )}
            {claimableFactory && (
              <ClaimCraftButton
                id="claim-button-factory"
                builtTile={buildingType}
                coords={position}
              />
            )}
            {canBeUpgraded(buildingEntity, buildingType, world, components) && (
              <UpgradeButton
                id="upgrade-button"
                buildingEntity={buildingEntity}
                builtTile={buildingType}
                coords={position}
              />
            )}
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
