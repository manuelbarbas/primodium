import { EntityID } from "@latticexyz/recs";
import { sortBy } from "lodash";
import { useMemo } from "react";
import { useAccount } from "src/hooks";
import { shortenAddress } from "src/util/common";

function getSortedEntries(data: Map<EntityID, number>) {
  return sortBy(Array.from(data.entries()), (entry) => -entry[1]); // Sort by score in descending order
}

export const Leaderboard: React.FC<{
  data: Map<EntityID, number> | undefined;
}> = ({ data }) => {
  const { address } = useAccount();

  if (!data) return null;

  const sortedEntries = useMemo(() => getSortedEntries(data), [data]);
  const playerPosition = sortedEntries.findIndex(
    (entry) => entry[0] === address
  );

  return (
    <div className="flex flex-col items-center gap-2 text-white w-96 min-w-full">
      <div className="w-full h-96 overflow-y-auto rounded-md bg-slate-900 text-sm space-y-2 scrollbar">
        {sortedEntries.map((entry, index) => {
          return (
            <div
              key={index}
              className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30"
            >
              <div>{index + 1}.</div>
              <div className="col-span-5 flex justify-between">
                <div>
                  {" "}
                  {address === entry[0] ? "You" : shortenAddress(entry[0])}
                </div>
                <div className="font-bold rounded-md bg-cyan-700 px-2">
                  {entry[1].toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <hr className="w-full border-t border-cyan-800" />
      <div className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800 text-sm">
        {address && (
          <div className="grid grid-cols-6 w-full">
            <div>{playerPosition === -1 ? "N/A" : playerPosition + 1}.</div>
            <div className="col-span-5 flex justify-between">
              <div className="bg-rose-800 px-2 rounded-md">You</div>
              <div className="font-bold rounded-md bg-cyan-700 px-2">
                {data.get(address)?.toLocaleString() ?? 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
