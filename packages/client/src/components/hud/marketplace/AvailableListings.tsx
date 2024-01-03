import { Entity } from "@latticexyz/recs";
import { EOrderType, EResource, EUnit } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { FaAngleDoubleRight, FaArrowLeft, FaArrowRight, FaMinus, FaPlay, FaSync } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { CurrencyDisplay } from "src/components/shared/CurrencyDisplay";
import { NumberInput } from "src/components/shared/NumberInput";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { ValueSansMetadata } from "src/network/components/customComponents/ExtendedComponent";
import { createHangar } from "src/network/systems/setupHangar";
import { formatNumber } from "src/util/common";
import { ResourceEntityLookup, ResourceImage, UnitEntityLookup } from "src/util/constants";
import { getFullResourceCount, getScale } from "src/util/resource";

type Listing = ValueSansMetadata<typeof components.MarketplaceOrder.schema> & { id: Entity };

export const AvailableListings = ({
  listings,
  takenOrders,
  setOrder,
  pageSize = 10,
}: {
  listings: Listing[];
  takenOrders: Record<Entity, bigint>;
  setOrder: (orderId: Entity, count: bigint) => void;
  pageSize?: number;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Listing | null; direction: "ascending" | "descending" }>({
    key: null,
    direction: "ascending",
  });
  const requestSort = (key: keyof Listing) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  const totalCost = Object.entries(takenOrders).reduce((acc, [id, count]) => {
    const listing = listings.find((listing) => listing.id === id);
    if (!listing) return acc;
    return acc + listing.price * count;
  }, 0n);

  const balance = components.WETHBalance.use(playerEntity)?.value ?? 0n;
  const remainingBalance = useMemo(() => balance - totalCost, [balance, totalCost]);
  const unitDisplay = useSettingsStore((state) => state.unitDisplay);

  const PaginationControls = () => {
    const totalPages = Math.ceil(sortedListings.length / pageSize);
    return (
      <div className="flex gap-2 items-center">
        <Button className={`btn-sm`} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage == 1}>
          <FaArrowLeft />
        </Button>

        {[...Array(totalPages).keys()].map((page) => {
          if (page > 13) return null;
          return (
            <Button
              className={`btn-sm ${currentPage - 1 == page ? "btn-secondary" : ""}`}
              key={page}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </Button>
          );
        })}
        {sortedListings.length > pageSize * 14 && (
          <Button
            className={`btn-sm ${currentPage > 14 ? "btn-secondary" : ""}`}
            onClick={() => (currentPage <= 14 ? handlePageChange(15) : null)}
          >
            {currentPage > 14 ? currentPage : 15}
          </Button>
        )}
        <Button
          className={`btn-sm`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage == totalPages}
        >
          <FaArrowRight />
        </Button>
        <Button className={`btn-sm`} onClick={() => handlePageChange(totalPages)} disabled={currentPage == totalPages}>
          <FaAngleDoubleRight className="pointer-events-none" />
        </Button>
        <div className="bg-black/10 rounded-md p-2 text-xs">
          {currentPage} / {totalPages}
        </div>
      </div>
    );
  };

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

  const currentListings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedListings.slice(startIndex, startIndex + pageSize);
  }, [sortedListings, currentPage, pageSize]);
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return <FaPlay className={`${sortConfig.direction === "ascending" ? "rotate-90" : "-rotate-90"} w-2`} />;
    }
    return <FaMinus className="w-2" />;
  };

  if (listings.length === 0)
    return <div className="w-full h-full text-center p-20 uppercase text-error animate-pulse">No listings</div>;

  return (
    <div className="p-2 flex flex-col justify-between h-full overflow-y-auto scrollbar">
      <table className="min-w-full divide-y divide-accent mb-2">
        <thead className="uppercase text-sm">
          <tr>
            <th></th>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("resource")}
                className="text-xs opacity-80 font-bold cursor-pointer flex gap-1 items-center"
              >
                Item {getSortIcon("resource")}
              </div>
            </th>

            <th className="sortable-header">
              <div
                onClick={() => requestSort("price")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer"
              >
                Price ({unitDisplay === "ether" ? "wETH" : "wGWEI"}) {getSortIcon("price")}
              </div>
            </th>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("count")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer"
              >
                Count {getSortIcon("count")}
              </div>
            </th>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("seller")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer"
              >
                Seller {getSortIcon("seller")}
              </div>
            </th>
            <th className="flex gap-1 items-center justify-center text-xs opacity-80 font-bold">Buy</th>
          </tr>
        </thead>
        <tbody>
          {currentListings.map((listing, index) => (
            <AvailableListing
              key={listing.id}
              listing={listing}
              className={`${index % 2 === 0 ? "bg-neutral/50" : ""}`}
              remainingBalance={remainingBalance}
              takenOrders={takenOrders}
              setOrder={setOrder}
            />
          ))}
        </tbody>
      </table>
      <PaginationControls />
    </div>
  );
};

const AvailableListing = ({
  listing,
  remainingBalance,
  takenOrders,
  setOrder,
  className = "",
}: {
  listing: Listing;
  takenOrders: Record<Entity, bigint>;
  remainingBalance: bigint;
  className?: string;
  setOrder: (orderId: Entity, count: bigint) => void;
}) => {
  const { playerAccount } = useMud();
  const [isSpinning, setIsSpinning] = useState(false);

  const entity =
    listing.orderType === EOrderType.Resource
      ? ResourceEntityLookup[listing.resource as EResource]
      : UnitEntityLookup[listing.resource as EUnit];
  const scale = getScale(entity);
  const scaledCount = Number(listing.count) / Number(scale);
  const startingValue = (takenOrders[listing.id] ?? 0n) / scale;
  const sellerHome = components.Home.use(listing.seller as Entity)?.asteroid as Entity | undefined;
  const sellerMaxResource = useMemo(() => {
    if (!sellerHome) return 0n;
    if (listing.orderType === EOrderType.Resource) {
      const { resourceCount } = getFullResourceCount(entity, sellerHome);
      return components.MarketplaceOrder.getAll().reduce((acc, entity) => {
        const _listing = components.MarketplaceOrder.get(entity)!;
        if (_listing.seller !== listing.seller || _listing.resource !== listing.resource) return acc;
        const remainingResource = acc - _listing.count;
        return remainingResource < 0n ? 0n : remainingResource;
      }, resourceCount);
    }
    const hangar = createHangar(sellerHome)?.get(entity) ?? 0n;
    return hangar;
  }, [listing, sellerHome, entity]);

  const max = Math.min(
    Number(sellerMaxResource / scale),
    listing.price ? Math.min(scaledCount, Number(remainingBalance / (listing.price * scale))) : scaledCount
  );

  const count = Math.min(scaledCount, Number(sellerMaxResource / scale));

  const handleSync = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 3000);

    if (listing.orderType === EOrderType.Resource || !sellerHome) return;
    // claimUnits(sellerHome, network);
  };

  // if (listing.price === 0n || count === 0) return <></>;

  return (
    <tr
      key={`listing-${listing.id}`}
      className={`${className} ${listing.seller === playerAccount.entity ? "pointer-events-none opacity-50" : ""}`}
    >
      <td className="py-4 flex justify-center w-fit">
        <Button className="btn-ghost p-1 h-fit" onClick={handleSync}>
          <FaSync className={`cursor-pointer ${isSpinning ? "animate-spin" : ""}`} />
        </Button>
      </td>
      <td className="">
        <IconLabel imageUri={ResourceImage.get(entity as Entity) ?? ""} tooltipDirection={"right"} text={""} />
      </td>

      <td className="py-4">
        <CurrencyDisplay wei={listing.price * scale} options={{ short: false }} className="text-sm font-normal" />
      </td>
      <td className="py-4">{formatNumber(count)}</td>
      <td className="py-4">
        <AccountDisplay player={listing.seller as Entity} />
      </td>
      <td className="py-4 flex justify-center">
        <NumberInput
          startingValue={Number(startingValue)}
          min={0}
          max={Number(max)}
          onChange={(e) => setOrder(listing.id, BigInt(e * Number(scale)))}
          reset={!takenOrders[listing.id]}
        />
      </td>
    </tr>
  );
};
