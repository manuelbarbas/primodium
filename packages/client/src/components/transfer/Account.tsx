import { FaClipboard, FaExclamationCircle, FaTrash } from "react-icons/fa";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { copyToClipboard } from "src/util/clipboard";
import { Button } from "../core/Button";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Delegate } from "./Delegate";

export function Account() {
  const mud = useMud();
  const { playerAccount } = mud;
  const { setNoExternalWallet } = useSettingsStore();

  const removeBurnerPlayerAccount = () => {
    const go = confirm(`Are you sure you want to delete your player account? Don't forget to backup your keys!`);
    if (!go) return;

    setNoExternalWallet(false);
    localStorage.removeItem("primodiumPlayerAccount");
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
