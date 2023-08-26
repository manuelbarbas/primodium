import {
  Account,
  Leaderboard as _Leaderboard,
} from "src/network/components/clientComponents";
import { shortenAddress } from "src/util/common";
import Modal from "../shared/Modal";
import { useState } from "react";
import { FaList } from "react-icons/fa";

export const Leaderboard = () => {
  const address = Account.use()?.value;
  const data = _Leaderboard.use();
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  if (!data || !address) return null;

  return (
    <>
      <div className="w-80 flex gap-1">
        <div className="flex gap-1 border border-slate-700 p-1 rounded-md bg-slate-800 text-sm my-2 flex-grow items-center">
          <p className="bg-rose-700 px-2 rounded-md font-bold">
            <span className="opacity-75">#</span>
            {data.playerRank}
          </p>
          <span>
            {data.scores.length > data.playerRank
              ? data.scores[data.playerRank - 1].toLocaleString()
              : 0}
          </span>
          <p className="text-xs opacity-50"> POINTS </p>
        </div>
        <button
          className="border border-cyan-700 p-1 rounded-md bg-slate-800 text-sm my-2 px-2"
          onClick={() => setShowLeaderboard(true)}
        >
          <FaList />
        </button>
      </div>
      <Modal
        title="Leaderboard"
        show={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      >
        <div className="flex flex-col items-center gap-2 text-white w-96 min-w-full">
          <div className="w-full h-96 overflow-y-auto rounded-md bg-slate-900 text-sm space-y-2 scrollbar">
            {data.players.map((player, index) => (
              <div
                key={index}
                className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30"
              >
                <div>{index + 1}.</div>
                <div className="col-span-5 flex justify-between">
                  <div>
                    {address === player ? "You" : shortenAddress(player)}
                  </div>
                  <div className="font-bold rounded-md bg-cyan-700 px-2">
                    {data.scores[index].toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr className="w-full border-t border-cyan-800" />
          <div className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800 text-sm">
            {address && (
              <div className="grid grid-cols-6 w-full">
                <div>{data.playerRank}.</div>
                <div className="col-span-5 flex justify-between">
                  <div className="bg-rose-800 px-2 rounded-md">You</div>
                  <div className="font-bold rounded-md bg-cyan-700 px-2">
                    {data.scores.length > data.playerRank
                      ? data.scores[data.playerRank - 1].toLocaleString()
                      : 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
