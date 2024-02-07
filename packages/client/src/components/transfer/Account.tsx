import { useState } from "react";
import { FaClipboard, FaExclamationCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useMud } from "src/hooks";
import { useNoExternalAccount } from "src/hooks/useNoExternalAccount";
import { copyToClipboard } from "src/util/clipboard";
import { Button } from "../core/Button";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Delegate } from "./Delegate";

export function Account() {
  const mud = useMud();
  const { playerAccount } = mud;
  const { setNoExternalAccount } = useNoExternalAccount();
  const [showingToast, setShowingToast] = useState(false);

  const removeBurnerPlayerAccount = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to delete your player account? Don&apos;t forget to backup your keys!
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                closeToast && closeToast();
                setNoExternalAccount(false);
                localStorage.removeItem("primodiumPlayerAccount");
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowingToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-primary btn-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        // className: "border-error",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      }
    );
  };

  return (
    <div className="h-full w-full relative flex flex-col justify-center items-center">
      <div className="flex w-full items-center px-4">
        <AccountDisplay noColor player={playerAccount.entity} className="text-sm" />
        {!!playerAccount.privateKey && (
          <>
            <Button
              tooltip="Copy address"
              onClick={() => copyToClipboard(playerAccount.address, "address")}
              tooltipDirection="top"
              className="btn-xs btn-ghost"
            >
              <FaClipboard />
            </Button>
            <Button
              tooltip="Copy Private Key"
              onClick={() => copyToClipboard(playerAccount.privateKey, "private key")}
              tooltipDirection="top"
              className="btn-xs btn-ghost"
            >
              <FaExclamationCircle className="text-error" />
            </Button>
            <Button className="btn-xs" onClick={removeBurnerPlayerAccount} tooltip="Delete account">
              <FaTrash />
            </Button>
          </>
        )}
      </div>
      <div className="p-2 h-full w-full flex flex-col gap-6">
        <Delegate />
      </div>
    </div>
  );
}
