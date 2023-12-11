import { Entity } from "@latticexyz/recs";
import { EOrderType, EResource, EUnit } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { FaAngleDoubleRight, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaMinus } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { ValueSansMetadata } from "src/network/components/customComponents/ExtendedComponent";
import { ResourceEntityLookup, UnitEntityLookup } from "src/util/constants";
import { getScale } from "src/util/resource";
import { formatEther } from "viem";

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
  const { network } = useMud();
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

  const balance = components.WETHBalance.use(network.playerEntity)?.value ?? 0n;
  const remainingBalance = useMemo(() => balance - totalCost, [balance, totalCost]);

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
      return sortConfig.direction === "ascending" ? <FaArrowDown /> : <FaArrowUp />;
    }
    return <FaMinus />;
  };

  if (listings.length === 0) return <div className="w-full h-full text-center p-20 uppercase bold">No listings</div>;

  return (
    <div className="p-2 flex flex-col justify-between h-full">
      <table className="min-w-full divide-y divide-accent">
        <thead className="uppercase text-sm">
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
            <th>Buy</th>
          </tr>
        </thead>
        <tbody>
          {currentListings.map((listing) => {
            const entity =
              listing.orderType === EOrderType.Resource
                ? ResourceEntityLookup[listing.resource as EResource]
                : UnitEntityLookup[listing.resource as EUnit];
            const scale = getScale(entity);
            const scaledCount = Number(listing.count) / Number(scale);
            const startingValue = (takenOrders[listing.id] ?? 0n) / scale;
            const max = Math.min(scaledCount, Number(remainingBalance / (listing.price * scale)));

            return (
              <tr key={`listing-${listing.id}`}>
                <td className="py-4 whitespace-nowrap">{formatEther(listing.price * scale)}</td>
                <td className="py-4 whitespace-nowrap">{scaledCount}</td>
                <td className="py-4 whitespace-nowrap">
                  <AccountDisplay player={listing.seller as Entity} />
                </td>
                <td className="py-4 whitespace-nowrap flex justify-center">
                  <NumberInput
                    startingValue={Number(startingValue)}
                    min={0}
                    max={Number(max)}
                    onChange={(e) => setOrder(listing.id, BigInt(e) * scale)}
                    reset={!takenOrders[listing.id]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <PaginationControls />
    </div>
  );
};
