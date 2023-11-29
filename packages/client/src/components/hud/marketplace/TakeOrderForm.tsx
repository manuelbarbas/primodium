import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import _ from "lodash";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button, IconButton } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { NumberInput } from "src/components/shared/NumberInput";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import {
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  ResourceImage,
  ResourceStorages,
} from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { takeOrders } from "src/util/web3/contractCalls/takeOrders";
import { formatEther } from "viem";
import { LinkedAddressDisplay } from "../LinkedAddressDisplay";
import { Listing } from "./Marketplace";

export function TakeOrderForm({
  orders: [takenOrders, setTakenOrders],
}: {
  orders: [Record<Entity, bigint>, Dispatch<SetStateAction<Record<Entity, bigint>>>];
}) {
  const { network } = useMud();
  const [selectedItem, setSelectedItem] = useState<Entity>(ResourceEntityLookup[EResource.Iron]);

  const allListings = components.MarketplaceOrder.useAll().map((order) => {
    return { ...components.MarketplaceOrder.get(order)!, id: order };
  });
  // const allListings = dummyListings;

  const takenResources: Record<Entity, bigint> = useMemo(() => {
    return Object.entries(takenOrders).reduce((acc, [id, count]) => {
      const listing = allListings.find((listing) => listing.id === id);
      if (!listing) return acc;
      const resource = ResourceEntityLookup[listing.resource as EResource];
      return { ...acc, [resource]: (acc[resource] ?? 0n) + count };
    }, {} as Record<Entity, bigint>);
  }, [takenOrders, allListings]);

  const itemListings = useMemo(() => {
    if (!selectedItem) return [];
    const resourceEnum = ResourceEnumLookup[selectedItem];
    return allListings.filter(
      (listing) => listing.resource === resourceEnum && network.playerEntity !== listing.seller
    );
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
  // Calculate total cost and taken resources
  const totalCost = Object.entries(takenOrders).reduce((acc, [id, count]) => {
    const listing = allListings.find((listing) => listing.id === id);
    if (!listing) return acc;
    return acc + listing.price * count;
  }, 0n);

  // Clear all selections
  const clearSelections = () => {
    setTakenOrders({});
  };
  return (
    <div className="grid grid-cols-10 grid-rows-3 h-full w-full gap-2">
      <SecondaryCard className="col-span-3 row-span-2 flex flex-col gap-2 overflow-auto scrollbar ">
        <p className="text-lg">Resources</p>
        {_.chunk(Array.from(ResourceStorages), 2).map((chunk, i) => (
          <div key={`chunk-${i}`} className="flex flex-row items-center gap-2 w-full">
            {chunk.map((resource) => (
              <IconButton
                key={resource}
                onClick={() => setSelectedItem(resource)}
                className={`flex-1 flex-col items-center justify-center p-10 ${
                  selectedItem === resource ? "bg-base-300 border-accent" : ""
                }`}
                imageUri={ResourceImage.get(resource) ?? ""}
                text={getBlockTypeName(resource)}
              />
            ))}
          </div>
        ))}
      </SecondaryCard>

      <SecondaryCard className="col-span-7 row-span-3 h-full w-full ">
        {selectedItem ? (
          <ResourceListings listings={itemListings} takenOrders={takenOrders} setOrder={handleTakeOrderChange} />
        ) : (
          <div className="w-full h-full text-center p-20 uppercase bold">Select a resource to view listings</div>
        )}
      </SecondaryCard>
      <SecondaryCard className="col-span-3 row-span-1 overflow-auto scrollbar flex flex-col justify-between">
        <p className="text-lg">Your Cart</p>
        <div className="p-2 text-center">
          <div className="flex flex-col justify-between items-center gap-2">
            {Object.entries(takenResources).length > 0 && (
              <div className="text-sm bg-black/10 p-2 rounded-md">
                Resources
                <div className="font-medium grid grid-cols-2 w-full gap-1">
                  {Object.entries(takenResources).map(([resource, count]) => (
                    <Badge className="text-xs gap-2" key={`taken-${resource}`}>
                      <ResourceIconTooltip
                        name={getBlockTypeName(resource as Entity)}
                        image={ResourceImage.get(resource as Entity) ?? ""}
                        resource={resource as Entity}
                        playerEntity={network.playerEntity}
                        amount={count}
                        fractionDigits={3}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xl">
              TOTAL: <span className="font-medium">{formatEther(totalCost)} WETH</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <TransactionQueueMask queueItemId={hashEntities(...[network.playerEntity, ...Object.keys(takenOrders)])}>
            <Button
              className="btn-secondary px-4"
              disabled={Object.keys(takenOrders).length === 0}
              onClick={() => {
                takeOrders(takenOrders, network);
              }}
            >
              Submit
            </Button>
          </TransactionQueueMask>

          <Button className="btn" onClick={clearSelections} disabled={Object.keys(takenOrders).length === 0}>
            Clear
          </Button>
        </div>
      </SecondaryCard>
    </div>
  );
}

const ResourceListings = ({
  listings,
  takenOrders,
  setOrder,
}: {
  listings: Listing[];
  takenOrders: Record<Entity, bigint>;
  setOrder: (orderId: Entity, count: bigint) => void;
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Listing | null; direction: "ascending" | "descending" }>({
    key: null,
    direction: "ascending",
  });

  const sortedListings = [...listings].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Listing) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? <FaArrowDown /> : <FaArrowUp />;
    }
    return <FaMinus />;
  };

  if (listings.length === 0) return <div className="w-full h-full text-center p-20 uppercase bold">No listings</div>;

  return (
    <div className="p-2">
      <table className="min-w-full divide-y divide-accent">
        <thead>
          <tr>
            <th className="sortable-header">
              <div onClick={() => requestSort("price")} className="flex gap-2 items-center cursor-pointer">
                Price {getSortIcon("price")}
              </div>
            </th>
            <th className="sortable-header">
              <div onClick={() => requestSort("count")} className="flex gap-2 items-center cursor-pointer">
                Count {getSortIcon("count")}
              </div>
            </th>
            <th className="sortable-header">
              <div onClick={() => requestSort("seller")} className="flex gap-2 items-center cursor-pointer">
                Seller {getSortIcon("seller")}
              </div>
            </th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {sortedListings.map((listing) => {
            const scaledCount = Number(listing.count) / Number(RESOURCE_SCALE);
            const startingValue = (takenOrders[listing.id] ?? 0n) / RESOURCE_SCALE;
            return (
              <tr key={`listing-${listing.id}`}>
                <td className="py-4 whitespace-nowrap">{formatEther(listing.price * RESOURCE_SCALE)}</td>
                <td className="py-4 whitespace-nowrap">{scaledCount}</td>
                <td className="py-4 whitespace-nowrap">
                  <LinkedAddressDisplay entity={listing.seller as Entity} />
                </td>
                <td className="py-4 whitespace-nowrap flex justify-center">
                  <NumberInput
                    startingValue={Number(startingValue)}
                    max={scaledCount}
                    onChange={(e) => setOrder(listing.id, BigInt(e) * RESOURCE_SCALE)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
