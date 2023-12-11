import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { FaAngleDoubleRight, FaArrowLeft, FaArrowRight, FaMinus, FaPlay, FaUndo } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { ResourceImage } from "src/util/constants";
import { getScale } from "src/util/resource";
import { cancelOrder, updateOrder } from "src/util/web3/contractCalls/updateOrder";
import { formatEther } from "viem";
import { UserListing } from "./CreateOrderForm";

export const PlayerListings = ({
  listings,
  availableItems,
  pageSize = 10,
}: {
  listings: UserListing[];
  availableItems: Record<Entity, bigint>;
  pageSize?: number;
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserListing | null;
    direction: "ascending" | "descending";
  }>({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const getCurrentListings = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedListings.slice(startIndex, startIndex + pageSize);
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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

  const requestSort = (key: keyof UserListing) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
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
    <div className="p-2 flex flex-col justify-between h-full">
      <table className="min-w-full divide-y divide-accent">
        <thead className="text-sm uppercase">
          <tr>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("item")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer"
              >
                Item {getSortIcon("item")}
              </div>
            </th>

            <th className="sortable-header">
              <div
                onClick={() => requestSort("price")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer justify-center"
              >
                Price {getSortIcon("price")}
              </div>
            </th>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("count")}
                className="flex gap-1 items-center text-xs opacity-80 font-bold cursor-pointer justify-center"
              >
                Count {getSortIcon("count")}
              </div>
            </th>
            <th className="sortable-header"></th>
            <th className="sortable-header"></th>
          </tr>
        </thead>
        <tbody>
          {getCurrentListings().map((listing) => (
            <Listing key={`listing-${listing.id}`} listing={listing} availableResource={availableItems[listing.item]} />
          ))}
        </tbody>
      </table>
      <PaginationControls />
    </div>
  );
};

const Listing = ({ listing, availableResource }: { listing: UserListing; availableResource: bigint }) => {
  const { network } = useMud();
  const [listingUpdate, setListingUpdate] = useState<{ newPrice?: bigint; newCount?: bigint }>();

  const scale = getScale(listing.item);

  const newCount = listingUpdate?.newCount;
  const countDiff = !!newCount && newCount !== listing.count;
  const newPrice = listingUpdate?.newPrice;
  const priceDiff = !!newPrice && newPrice !== listing.price;
  return (
    <tr key={`listing-${listing.id}`}>
      <td className="text-center align-middle ">
        <div className="flex items-center justify-center h-full">
          <IconLabel imageUri={ResourceImage.get(listing.item as Entity) ?? ""} tooltipDirection={"right"} text={""} />
          <p className="text-xs text-gray-500 ml-1">({availableResource.toString()})</p>
        </div>
      </td>

      <td className="text-center align-middle py-1">
        <div className="flex justify-center p-1 gap-1 items-center">
          <NumberInput
            toFixed={8}
            reset={!newPrice}
            startingValue={Number(formatEther(listing.price * scale))}
            onChange={function (val: number): void {
              setListingUpdate({
                ...listingUpdate,
                newPrice: BigInt(val * 1e18) / scale,
              });
            }}
          />
          <FaUndo
            className={`${!priceDiff ? "opacity-25" : ""}`}
            onClick={() => {
              setListingUpdate({ ...listingUpdate, newPrice: undefined });
            }}
          />
        </div>
      </td>
      <td className="text-center align-middle">
        <div className="flex justify-center p-1 gap-1 items-center">
          <NumberInput
            startingValue={Number(listing.count / scale)}
            max={Number(availableResource)}
            toFixed={2}
            reset={!newCount}
            onChange={function (val: number): void {
              setListingUpdate({
                ...listingUpdate,
                newCount: BigInt(val) * scale,
              });
            }}
          />
          <FaUndo
            className={`${!countDiff ? "opacity-25" : ""}`}
            onClick={() => {
              setListingUpdate({
                ...listingUpdate,
                newCount: undefined,
              });
            }}
          />
        </div>
      </td>
      <td className="text-center">
        <Button
          disabled={!priceDiff && !countDiff}
          onClick={() => {
            updateOrder(listing.id, listing.item, newPrice || listing.price, newCount || listing.count, network);
          }}
          className="btn-primary btn-sm"
        >
          Update
        </Button>
      </td>
      <td className="text-center">
        <Button onClick={() => cancelOrder(listing.id, network)} className="btn-primary btn-sm">
          Delete
        </Button>
      </td>
    </tr>
  );
};
