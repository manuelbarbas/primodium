import { Entity } from "@latticexyz/recs";
import { EOrderType, EResource, EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { FaTrash } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { ResourceEntityLookup, ResourceImage, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { takeOrders } from "src/util/web3/contractCalls/takeOrders";
import { formatEther } from "viem";

export const Cart = ({
  takenOrders,
  removeOrder,
  clearOrders,
}: {
  takenOrders: Record<Entity, bigint>;
  removeOrder: (id: Entity) => void;
  clearOrders: () => void;
}) => {
  const { network } = useMud();
  const balance = components.WETHBalance.use(network.playerEntity)?.value ?? 0n;
  const allListings = components.MarketplaceOrder.useAll().map((order) => {
    return { ...components.MarketplaceOrder.get(order)!, id: order };
  });

  const takenOrdersFullData = useMemo(() => {
    return Object.entries(takenOrders).map(([id, count]) => {
      const listing = allListings.find((listing) => listing.id === id)!;
      const resource =
        listing.orderType == EOrderType.Resource
          ? ResourceEntityLookup[listing.resource as EResource]
          : UnitEntityLookup[listing.resource as EUnit];
      return { ...listing, count, resource };
    });
  }, [takenOrders, allListings]);

  const totalCost = Object.entries(takenOrders).reduce((acc, [id, count]) => {
    const listing = allListings.find((listing) => listing.id === id);
    if (!listing) return acc;
    return acc + listing.price * count;
  }, 0n);

  const Order = ({ listing }: { listing: (typeof takenOrdersFullData)[0] }) => (
    <Badge className="flex w-full p-3 text-sm justify-between items-center">
      <ResourceIconTooltip
        name={getBlockTypeName(listing.resource)}
        image={ResourceImage.get(listing.resource) ?? ""}
        resource={listing.resource}
        amount={listing.count}
        fractionDigits={3}
      />
      <span className="text-xs">{formatEther(listing.price * listing.count)} WETH</span>
      <FaTrash className="cursor-pointer text-error" onClick={() => removeOrder(listing.id as Entity)} />
    </Badge>
  );

  return (
    <>
      <p className="text-xs opacity-50 font-bold pb-2 uppercase">Cart</p>
      <div className="flex flex-col items-center gap-1 text-sm bg-black/10 p-2 rounded-md w-full h-full overflow-auto scrollbar">
        {Object.entries(takenOrdersFullData).map(([id, listing]) => (
          <Order listing={listing} key={`taken-${id}`} />
        ))}
      </div>

      <div className="flex gap-2 w-full">
        <div className="flex gap-1 flex-col items-center justify-center w-full">
          <p>
            <span className="font-medium">{formatEther(totalCost)} WETH</span>
          </p>
          <span className="text-xs text-gray-400">balance: {formatEther(balance)} WETH</span>
        </div>

        <TransactionQueueMask queueItemId={hashEntities(network.playerEntity, ...Object.keys(takenOrders))}>
          <Button
            className="btn-secondary h-full"
            disabled={Object.keys(takenOrders).length === 0}
            onClick={() => {
              takeOrders(takenOrders, network);
              clearOrders();
            }}
          >
            Purchase
          </Button>
        </TransactionQueueMask>

        <Button className="btn h-full" onClick={clearOrders} disabled={Object.keys(takenOrders).length === 0}>
          Clear
        </Button>
      </div>
    </>
  );
};
