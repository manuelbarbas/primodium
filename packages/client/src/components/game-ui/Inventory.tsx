import { EntityID, EntityIndex } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import ClaimButton from "../action/ClaimButton";
import { BlockType, ResourceImage } from "src/util/constants";
import { useGameStore } from "src/store/GameStore";
import { BlockNumber } from "src/network/components/clientComponents";
import {
  Level,
  Item,
  LastClaimedAt,
  MainBase,
  PlayerProduction,
  MaxStorage,
  UnclaimedResource,
  MaxPassive,
  OccupiedPassiveResource,
} from "src/network/components/chainComponents";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { useMud } from "src/hooks";

export const Inventory = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const mainBaseCoord = useMainBaseCoord();
  const mainBase = MainBase.use(undefined, { value: "-1" as EntityID }).value;

  const level = Level.use(mainBase);
  useEffect(() => {
    if (level === undefined) return;

    setMenuIndex(0);
  }, [level]);

  return (
    <div
      style={{ filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))" }}
      className="flex fixed top-8 right-8 items-center font-mono text-white "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 200 }}
      >
        <div className={`${crtEffect ? "skew-x-1 skew-y-1" : ""}`}>
          <motion.div layout="position" className="flex justify-center">
            <Inventory.Button
              name="Inventory"
              icon="/img/icons/inventoryicon.png"
              active={menuIndex === 0}
              onClick={() => setMenuIndex(menuIndex === 0 ? null : 0)}
            />
            <Inventory.Button
              name="Utilities"
              icon="/img/icons/utilitiesicon.png"
              active={menuIndex === 1}
              onClick={() => setMenuIndex(menuIndex === 1 ? null : 1)}
            />
          </motion.div>

          {menuIndex === 0 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-72 border border-cyan-600 p-2 text-xs min-h-[5rem]"
            >
              <Inventory.AllResourceLabels />
            </motion.div>
          )}

          {menuIndex === 1 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-72 border border-cyan-600 p-2 text-xs min-h-[5rem]"
            >
              <Inventory.AllPassiveResourceLabels />
            </motion.div>
          )}

          {menuIndex === 0 && (
            <div className="flex justify-center">
              {mainBaseCoord !== undefined && (
                <ClaimButton id="claim-button" coords={mainBaseCoord} />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

Inventory.Button = ({
  name,
  icon,
  active = false,
  onClick,
}: {
  name: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      key={name}
      id={name}
      className={`flex pixel-images items-center bg-slate-900/90 py-1 px-2 outline-none crt text-sm border border-cyan-600 ${
        active ? " ring-4 ring-cyan-900 bg-cyan-600 z-10 font-bold" : ""
      }`}
      onClick={onClick}
    >
      <img src={icon} className="w-6 h-6 p-1 pixel-images" /> {name}
    </button>
  );
};

Inventory.AllResourceLabels = ({
  entityIndex,
}: {
  entityIndex?: EntityIndex;
}) => {
  return (
    <>
      <Inventory.ResourceLabel
        name={"Iron"}
        entityIndex={entityIndex}
        resourceId={BlockType.Iron}
      />
      <Inventory.ResourceLabel
        name={"Copper"}
        entityIndex={entityIndex}
        resourceId={BlockType.Copper}
      />
      <Inventory.ResourceLabel
        name={"Bolutite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Bolutite}
      />
      <Inventory.ResourceLabel
        name={"Iridium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Iridium}
      />
      <Inventory.ResourceLabel
        name={"Kimberlite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Kimberlite}
      />
      <Inventory.ResourceLabel
        name={"Lithium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Lithium}
      />
      <Inventory.ResourceLabel
        name={"Osmium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Osmium}
      />
      <Inventory.ResourceLabel
        name={"Titanium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Titanium}
      />
      <Inventory.ResourceLabel
        name={"Tungsten"}
        entityIndex={entityIndex}
        resourceId={BlockType.Tungsten}
      />
      <Inventory.ResourceLabel
        name={"Uraninite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Uraninite}
      />
      <Inventory.ResourceLabel
        name={"Bullet"}
        entityIndex={entityIndex}
        resourceId={BlockType.BulletCrafted}
      />
      <Inventory.ResourceLabel
        name={"Iron Plate"}
        entityIndex={entityIndex}
        resourceId={BlockType.IronPlateCrafted}
      />
      <Inventory.ResourceLabel
        name={"Basic Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.BasicPowerSourceCrafted}
      />
      <Inventory.ResourceLabel
        name={"Kinetic Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.KineticMissileCrafted}
      />
      <Inventory.ResourceLabel
        name={"Refined Osmium"}
        entityIndex={entityIndex}
        resourceId={BlockType.RefinedOsmiumCrafted}
      />
      <Inventory.ResourceLabel
        name={"Advanced Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.AdvancedPowerSourceCrafted}
      />
      <Inventory.ResourceLabel
        name={"Penetrating Warhead"}
        entityIndex={entityIndex}
        resourceId={BlockType.PenetratingWarheadCrafted}
      />
      <Inventory.ResourceLabel
        name={"Penetrating Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.PenetratingMissileCrafted}
      />
      <Inventory.ResourceLabel
        name={"Tungsten Rods"}
        entityIndex={entityIndex}
        resourceId={BlockType.TungstenRodsCrafted}
      />
      <Inventory.ResourceLabel
        name={"Iridium Crystal"}
        entityIndex={entityIndex}
        resourceId={BlockType.IridiumCrystalCrafted}
      />
      <Inventory.ResourceLabel
        name={"Iridium Drillbit"}
        entityIndex={entityIndex}
        resourceId={BlockType.IridiumDrillbitCrafted}
      />
      <Inventory.ResourceLabel
        name={"Laser Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.LaserPowerSourceCrafted}
      />
      <Inventory.ResourceLabel
        name={"Thermobaric Warhead"}
        entityIndex={entityIndex}
        resourceId={BlockType.ThermobaricWarheadCrafted}
      />
      <Inventory.ResourceLabel
        name={"Thermobaric Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.ThermobaricMissileCrafted}
      />
      <Inventory.ResourceLabel
        name={"Kimberlite Catalyst"}
        entityIndex={entityIndex}
        resourceId={BlockType.KimberliteCrystalCatalystCrafted}
      />
      <Inventory.ResourceLabel
        name={"Alloy"}
        entityIndex={entityIndex}
        resourceId={BlockType.AlloyCraftedItem}
      />
      <Inventory.ResourceLabel
        name={"Photovoltaic Cell"}
        entityIndex={entityIndex}
        resourceId={BlockType.LithiumCopperOxideCraftedItem}
      />
    </>
  );
};

Inventory.AllPassiveResourceLabels = ({
  entityIndex,
}: {
  entityIndex?: EntityIndex;
}) => {
  const { components } = useMud();

  const passiveCapacity = useResourceCount(
    components.MaxPassive,
    BlockType.ElectricityPassiveResource,
    entityIndex
  );
  if (!passiveCapacity)
    return (
      <div className="flex justify-center items-center text-lg">
        No Utilities
      </div>
    );
  return (
    <>
      <Inventory.PassiveResourceLabel
        name={"Electricity"}
        entityIndex={entityIndex}
        resourceId={BlockType.ElectricityPassiveResource}
      />
    </>
  );
};

Inventory.ResourceLabel = ({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) => {
  const blockNumber = BlockNumber.use(undefined, { value: 0 })?.value;

  const resourceCount = useResourceCount(Item, resourceId, entityIndex);

  const maxStorage = useResourceCount(MaxStorage, resourceId, entityIndex);

  const production = useResourceCount(
    PlayerProduction,
    resourceId,
    entityIndex
  );

  const lastClaimedAt = useResourceCount(
    LastClaimedAt,
    resourceId,
    entityIndex
  );

  const unclaimedResource = useResourceCount(
    UnclaimedResource,
    resourceId,
    entityIndex
  );

  const resourcesToClaim = useMemo(() => {
    const toClaim =
      unclaimedResource + (blockNumber - lastClaimedAt) * production;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
    return (
      <div className="mb-1">
        <div className="flex justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
          <p>{production ? `${production}/BLOCK` : "-"}</p>
        </div>
        <div
          className={`flex items-center bottom-0 left-1/2 -translate-x-1/2 w-full h-2 ring-2 ring-slate-900/90 crt ${
            resourceCount + resourcesToClaim === maxStorage
              ? "animate-pulse"
              : ""
          }`}
        >
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / maxStorage) * 100}%` }}
          />

          <div
            className="h-full bg-cyan-800"
            style={{
              width: `${(resourcesToClaim / maxStorage) * 100}%`,
            }}
          />
          <div
            className="h-full bg-gray-900"
            style={{
              width: `${
                ((maxStorage - resourceCount - resourcesToClaim) / maxStorage) *
                100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between">
          <p>
            {resourceCount}{" "}
            {resourcesToClaim > 0 && (
              <span className="opacity-50">(+{resourcesToClaim})</span>
            )}
          </p>
          <b>{maxStorage}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

Inventory.PassiveResourceLabel = ({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) => {
  const blockNumber = BlockNumber.get();

  const resourceCount = useResourceCount(
    OccupiedPassiveResource,
    resourceId,
    entityIndex
  );

  const maxStorage = useResourceCount(MaxPassive, resourceId, entityIndex);

  const production = useResourceCount(
    PlayerProduction,
    resourceId,
    entityIndex
  );

  const lastClaimedAt = useResourceCount(
    LastClaimedAt,
    resourceId,
    entityIndex
  );

  const unclaimedResource = useResourceCount(
    UnclaimedResource,
    resourceId,
    entityIndex
  );

  const resourcesToClaim = useMemo(() => {
    const toClaim =
      unclaimedResource +
      ((blockNumber?.value ?? 0) - lastClaimedAt) * production;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
    return (
      <div className="mb-1">
        <div className="flex justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
        </div>
        <div>
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / maxStorage) * 100}%` }}
          />
          <div
            className="h-full bg-cyan-800"
            style={{ width: `${(resourcesToClaim / maxStorage) * 100}%` }}
          />
          <div
            className="h-full bg-gray-900"
            style={{
              width: `${
                ((maxStorage - resourceCount - resourcesToClaim) / maxStorage) *
                100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between">
          <p>{resourceCount}</p>
          <b>{maxStorage}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
