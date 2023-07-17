import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { useMud } from "src/context/MudContext";
import { BlockType, ResourceImage } from "src/util/constants";
import { EntityID, EntityIndex } from "@latticexyz/recs";
import { useComponentValue } from "src/hooks/useComponentValue";
import useResourceCount from "src/hooks/useResourceCount";
import { ImageButton } from "../shared/ImageButton";

export const Inventory = () => {
  const network = useMud();
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const gameReady = primodium.hooks.useGameReady(network);
  const keybinds = primodium.hooks.useKeybinds();

  return (
    <div className="flex fixed top-8 right-8 items-center font-mono text-white ">
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 200 }}
      >
        <div className="skew-x-1 skew-y-1">
          <motion.div layout="position" className="flex justify-center">
            <Inventory.Button
              name="Inventory"
              icon="/img/icons/inventoryicon.png"
              active={menuIndex === 0}
              onClick={() => setMenuIndex(menuIndex === 0 ? null : 0)}
            />
          </motion.div>

          {menuIndex === 0 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-72 border border-cyan-600 p-2 text-xs"
            >
              <Inventory.AllResourceLabels />
            </motion.div>
          )}

          {menuIndex === 0 && (
            <div className="flex justify-center">
              <ImageButton
                className="w-24 h-12 text-cyan-100 text-sm border-2 border-cyan-600 mt-1"
                image="/img/buttons/rectangle/blue/up.png"
                activeImage="/img/buttons/rectangle/blue/down.png"
              >
                <p className="-translate-y-[2px] active:translate-y-0 font-bold leading-none h-full flex justify-center items-center crt">
                  Claim
                </p>
              </ImageButton>
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
  const { components, offChainComponents, singletonIndex } = useMud();

  const blockNumber = useComponentValue(
    offChainComponents.BlockNumber,
    singletonIndex
  );

  const resourceCount = useResourceCount(
    components.Item,
    resourceId,
    entityIndex
  );

  const storageCount = useResourceCount(
    components.StorageCapacity,
    resourceId,
    entityIndex
  );

  const production = useResourceCount(components.Mine, resourceId, entityIndex);

  const lastClaimedAt = useResourceCount(
    components.LastClaimedAt,
    resourceId,
    entityIndex
  );

  const unclaimedResource = useResourceCount(
    components.UnclaimedResource,
    resourceId,
    entityIndex
  );

  const resourcesToClaim = useMemo(() => {
    const toClaim =
      unclaimedResource +
      ((blockNumber?.value ?? 0) - lastClaimedAt) * production;
    if (toClaim > storageCount - resourceCount)
      return storageCount - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (storageCount > 0) {
    return (
      <div className="mb-1">
        <div className="flex justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
          <p>{production}/B</p>
        </div>
        <div className="flex items-center bottom-0 left-1/2 -translate-x-1/2 w-full h-2 ring-2 ring-slate-900/90 crt">
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / storageCount) * 100}%` }}
          />
          <div
            className="h-full bg-cyan-800"
            style={{ width: `${(resourcesToClaim / storageCount) * 100}%` }}
          />
          <div
            className="h-full bg-gray-900"
            style={{
              width: `${
                ((storageCount - resourceCount - resourcesToClaim) /
                  storageCount) *
                100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between">
          <p>
            {resourceCount}{" "}
            <span className="opacity-50">(+{resourcesToClaim})</span>
          </p>
          <b>{storageCount}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
