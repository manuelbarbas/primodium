import { Entity } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToAddress } from "src/util/common";
import { Button } from "../core/Button";
import { AddressDisplay } from "../hud/AddressDisplay";

export function Link() {
  const { sessionAccount, playerAccount } = useMud();

  const delegate = components.Delegate.use(playerAccount.entity)?.value as Entity;
  const delegateAddress = entityToAddress(delegate);

  if (delegate && sessionAccount?.entity === delegate)
    return (
      <div className="text-gray-300 flex justify-center items-center font-bold h-full">These accounts are linked</div>
    );
  return (
    <div className="flex flex-col h-full gap-2 text-left">
      <AddressDisplay address={playerAccount.address} notShort className="p-2 bg-gray-700 text-white text-center" />
      <div className="text-xs text-gray-300 inline flex gap-1">
        Delegate low risk actions (
        {delegate ? (
          <>
            linked to
            <AddressDisplay address={delegateAddress} />
          </>
        ) : (
          "unlinked"
        )}
        ) to a session wallet
      </div>
      <AddressDisplay address={delegateAddress} notShort className="p-2 bg-gray-700 text-white text-center" />
      <Button className="btn-secondary disabled:opacity-50 flex-1" onClick={() => {}}>
        <div className="font-bold crt">Link Accounts</div>
      </Button>
    </div>
  );
}
