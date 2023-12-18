import { Entity } from "@latticexyz/recs";
import { EOrderType, EResource, EUnit } from "contracts/config/enums";
import { useCallback, useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { formatNumber, getBlockTypeName } from "src/util/common";
import { EntityType, ResourceEntityLookup, ResourceStorages, UnitEntityLookup, UnitStorages } from "src/util/constants";
import { getScale } from "src/util/resource";
import { createOrder } from "src/util/web3/contractCalls/createOrder";
import { PlayerListings } from "./PlayerListings";
import { useSettingsStore } from "src/game/stores/SettingsStore";

export type UserListing = {
  item: Entity;
  price: bigint;
  count: bigint;
  seller: Entity;
  id: Entity;
};

export const CreateOrderForm = () => {
  const { network } = useMud();
  // State for form fields
  const [selectedItem, setSelectedItem] = useState<Entity | "default">("default");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const resources = useMemo(() => [...ResourceStorages], []);
  const unitDisplay = useSettingsStore((state) => state.unitDisplay);
  const units = useMemo(() => [...UnitStorages], []);

  const selectedScale = selectedItem === "default" ? 1n : getScale(selectedItem);
  // Handle form submission
  const handleSubmit = (e: React.MouseEvent | undefined) => {
    e?.preventDefault();
    const scaledPrice = BigInt(Math.round(Number(price) * (unitDisplay === "ether" ? 1e18 : 1e9))) / selectedScale;
    const scaledQuantity = BigInt(quantity) * selectedScale;
    if (selectedItem === "default") return;
    createOrder(selectedItem, scaledQuantity, scaledPrice, network);
  };

  const allListings: UserListing[] = components.MarketplaceOrder.useAll().map((orderEntity) => {
    const order = components.MarketplaceOrder.get(orderEntity)!;
    const item =
      order.orderType === EOrderType.Resource
        ? ResourceEntityLookup[order.resource as EResource]
        : UnitEntityLookup[order.resource as EUnit];
    return {
      item,
      price: order.price,
      count: order.count,

      seller: order.seller as Entity,
      id: orderEntity,
    };
  });

  const home = components.Home.use(network.playerEntity)?.asteroid as Entity | undefined;
  const ownedUnits = components.Hangar.use(home);
  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!ownedUnits) return 0n;
      const index = ownedUnits.units.indexOf(unit);
      if (index === -1) return 0n;
      return ownedUnits.counts[index];
    },
    [ownedUnits]
  );
  const resourceCounts = useFullResourceCounts();
  const ordersAvailable = useMemo(
    () => resourceCounts.get(EntityType.MaxOrders)?.resourceCount ?? 0n,
    [resourceCounts]
  );

  const itemListings = useMemo(() => {
    return allListings.filter((listing) => network.playerEntity === listing.seller);
  }, [allListings, network.playerEntity]);

  const availableItems = useMemo(() => {
    const itemsUsed: Record<Entity, bigint> = {};
    itemListings.forEach((listing) => {
      if (!itemsUsed[listing.item]) itemsUsed[listing.item] = 0n;
      itemsUsed[listing.item] += listing.count;
    });
    resources.forEach((resource) => {
      const resourceCount = resourceCounts.get(resource)?.resourceCount ?? 0n;
      const resourcesToClaim = resourceCounts.get(resource)?.resourcesToClaim ?? 0n;
      const totalResources = resourceCount + resourcesToClaim;
      itemsUsed[resource] = totalResources - (itemsUsed[resource] ?? 0n);
    });
    units.forEach((unit) => {
      const unitCount = getUnitCount(unit);
      itemsUsed[unit] = unitCount - (itemsUsed[unit] ?? 0n);
    });
    return itemsUsed;
  }, [resourceCounts, resources, units, getUnitCount, itemListings]);

  if (!home) return null;
  return (
    <div className="w-full h-full grid grid-cols-10 flex gap-4">
      <SecondaryCard className="col-span-3 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-xs opacity-50 font-bold pb-2 uppercase">New order</p>
        <form className="max-w-lg flex flex-col w-full gap-4">
          <select
            id="resource"
            placeholder="Select Item"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value as Entity)}
            className={`w-full p-4 bg-white/10 ${
              selectedItem === "default" ? "text-gray-500" : "text-gray-300"
            } font-bold text-sm focus:ring-secondary focus:border-secondary`}
          >
            <option className="text-gray-300 opacity-50 font-mono" value="default" disabled hidden>
              Select an item
            </option>
            {[...resources, ...units].map((resource) => (
              <option key={resource} value={resource} className="font-mono font-bold">
                {getBlockTypeName(resource)}
              </option>
            ))}
          </select>
          <div className="flex w-full items-center text-xs font-bold justify-between">
            PRICE
            <NumberInput
              toFixed={unitDisplay === "ether" ? 9 : 0}
              onChange={(value) => {
                setPrice(value.toString());
              }}
            />
          </div>
          <div className="flex w-full items-center text-xs font-bold justify-between">
            QTY
            <NumberInput toFixed={0} onChange={(value) => setQuantity(value.toString())} />
          </div>

          {ordersAvailable === 0n && <p className="text-center animate-pulse text-xs text-error">NOT ENOUGH ORDERS</p>}
          {ordersAvailable !== 0n && selectedItem !== "default" && (
            <div
              className={`text-center text-xs uppercase ${
                availableItems[selectedItem] == 0n ? "animate-pulse text-error" : "font-gray-500"
              }`}
            >
              {formatNumber(availableItems[selectedItem] / selectedScale)} {getBlockTypeName(selectedItem)} available
            </div>
          )}
          <Button
            disabled={
              !price ||
              !quantity ||
              selectedItem == "default" ||
              BigInt(quantity) > availableItems[selectedItem] ||
              ordersAvailable == 0n
            }
            onClick={handleSubmit}
            className="w-full bg-secondary p-4"
          >
            Submit
          </Button>
        </form>
      </SecondaryCard>
      <SecondaryCard className="col-span-7 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-xs opacity-50 font-bold pb-2 uppercase">Manage listings</p>
        <PlayerListings listings={itemListings} availableItems={availableItems} />
      </SecondaryCard>
    </div>
  );
};
