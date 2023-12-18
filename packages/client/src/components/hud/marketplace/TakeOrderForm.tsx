import { Entity } from "@latticexyz/recs";
import { EOrderType } from "contracts/config/enums";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { IconButton } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { ResourceEnumLookup, ResourceImage, ResourceStorages, UnitEnumLookup, UnitStorages } from "src/util/constants";
import { AvailableListings } from "./AvailableListings";
import { Cart } from "./Cart";

export function TakeOrderForm() {
  const { network } = useMud();

  const [takenOrders, setTakenOrders] = useState<Record<Entity, bigint>>({});
  const [selectedItem, setSelectedItem] = useState<Entity>();

  const allListings = components.MarketplaceOrder.useAll().map((order) => {
    return { ...components.MarketplaceOrder.get(order)!, id: order };
  });

  useEffect(() => {
    Object.keys(takenOrders).forEach((id) => {
      if (!allListings.find((listing) => listing.id === id)) {
        const newList = { ...takenOrders };
        delete newList[id as Entity];
        setTakenOrders(newList);
      }
    });
  }, [takenOrders, allListings]);

  const itemListings = useMemo(() => {
    return allListings.filter((listing) => {
      if (network.playerEntity == listing.seller) return false;
      if (listing.price === 0n) return false;
      if (!selectedItem) return true;
      const itemEnum =
        listing.orderType === EOrderType.Resource ? ResourceEnumLookup[selectedItem] : UnitEnumLookup[selectedItem];
      return listing.resource === itemEnum;
    });
  }, [allListings, selectedItem, network.playerEntity]);

  // Update taken orders
  const handleTakeOrderChange = (id: Entity, count: bigint) => {
    if (count === 0n) {
      const newTakenOrders = { ...takenOrders };
      delete newTakenOrders[id];
      setTakenOrders(newTakenOrders);
      return;
    }
    setTakenOrders({ ...takenOrders, [id]: count });
  };

  // Clear all selections
  const clearOrders = () => {
    setTakenOrders({});
  };

  const removeOrder = (id: Entity) => {
    const newList = { ...takenOrders };
    delete newList[id as Entity];
    setTakenOrders(newList);
  };

  return (
    <div className="grid grid-cols-10 grid-rows-5 h-full w-full gap-2">
      <SecondaryCard className="col-span-3 row-span-3 flex flex-col gap-2 overflow-hidden">
        <p className="text-xs opacity-50 font-bold">ITEMS</p>
        <div className="flex flex-col overflow-y-auto scrollbar gap-2">
          {_.chunk([...ResourceStorages, ...UnitStorages], 2).map((chunk, i) => (
            <div key={`chunk-${i}`} className="flex flex-col lg:flex-row items-center gap-2 w-full">
              {chunk.map((resource) => (
                <IconButton
                  key={resource}
                  onClick={() => (selectedItem == resource ? setSelectedItem(undefined) : setSelectedItem(resource))}
                  className={`flex-1 flex-col w-full lg:w-auto items-center justify-center p-4 ${
                    selectedItem === resource ? "bg-base-300 border-accent" : ""
                  }`}
                  imageUri={ResourceImage.get(resource) ?? ""}
                  text={getBlockTypeName(resource)}
                />
              ))}
            </div>
          ))}
        </div>
      </SecondaryCard>

      <SecondaryCard className="col-span-7 row-span-5 h-full w-full ">
        <p className="text-xs opacity-50 font-bold pb-2 uppercase">Listings</p>
        <AvailableListings listings={itemListings} takenOrders={takenOrders} setOrder={handleTakeOrderChange} />
      </SecondaryCard>
      <SecondaryCard className="col-span-3 row-span-2 overflow-auto scrollbar flex flex-col gap-1 justify-between overflow-hidden">
        <Cart takenOrders={takenOrders} clearOrders={clearOrders} removeOrder={removeOrder} />
      </SecondaryCard>
    </div>
  );
}
