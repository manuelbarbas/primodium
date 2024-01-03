import { Entity } from "@latticexyz/recs";
import { EOrderType, EResource, EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { FaTrash, FaWallet } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { CurrencyDisplay } from "src/components/shared/CurrencyDisplay";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { takeOrders } from "src/network/setup/contractCalls/takeOrders";
import { getBlockTypeName } from "src/util/common";
import { ResourceEntityLookup, ResourceImage, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";

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
  const unitDisplay = useSettingsStore((state) => state.unitDisplay);

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
      <span className="text-xs">
        <CurrencyDisplay wei={listing.price * listing.count} className="text-xs" />{" "}
        {unitDisplay === "ether" ? "wETH" : "wGWEI"}
      </span>

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

      <div className="flex gap-2 w-full items-center">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="font-bold inline flex items-center gap-1">
            <CurrencyDisplay wei={totalCost} className="text-sm" />
            <p className="inline text-success">{unitDisplay === "ether" ? "wETH" : "wGWEI"}</p>
          </div>
          <span className="text-xs text-gray-400 flex gap-1 items-center">
            <FaWallet />
            <CurrencyDisplay wei={balance} className="font-bold" />
            {unitDisplay === "ether" ? "wETH" : "wGWEI"}
          </span>
        </div>

        <TransactionQueueMask queueItemId={hashEntities(network.playerEntity, ...Object.keys(takenOrders))}>
          <Button
            className="btn-secondary h-full btn-sm"
            disabled={Object.keys(takenOrders).length === 0}
            onClick={() => {
              takeOrders(takenOrders, network);
              clearOrders();
            }}
          >
            Buy
          </Button>
        </TransactionQueueMask>

        <Button className="btn h-full btn-sm" onClick={clearOrders} disabled={Object.keys(takenOrders).length === 0}>
          Clear
        </Button>
      </div>
    </>
  );
};
