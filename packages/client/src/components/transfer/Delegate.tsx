import { Entity } from "@latticexyz/recs";
import { useMemo, useState } from "react";
import { FaAmbulance, FaTrash } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { grantAccess, switchDelegate } from "src/network/setup/contractCalls/access";
import { entityToAddress } from "src/util/common";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Button } from "../core/Button";
import { AddressDisplay } from "../hud/AddressDisplay";
import { AccountDisplay } from "../shared/AccountDisplay";

function findEntriesWithPrefix(prefix: string) {
  // Array to hold the matched entries
  const matchedEntries = [];

  // Define the prefix

  // Loop through all keys in local storage
  for (let i = 0; i < localStorage.length; i++) {
    // Get key at the current index
    const key = localStorage.key(i);
    if (!key) continue;

    // Check if the key starts with the specified prefix
    if (key.startsWith(prefix)) {
      // Splice content after the prefix
      const splicedContent = key.slice(prefix.length);

      // Retrieve the value
      const value = localStorage.getItem(key);

      if (!value) continue;
      // Add the spliced content and value to the array as an object
      matchedEntries.push({ publicKey: splicedContent, privateKey: value });
    }
  }
  return matchedEntries;
}

export function Delegate() {
  const mud = useMud();
  const { sessionAccount, playerAccount } = mud;
  const [privateKey, setPrivateKey] = useState("");
  const [keyUpdate, setKeyUpdate] = useState(0); // state to trigger updates

  // Function to handle private key validation and connection
  const delegate = components.Delegate.use(playerAccount.entity)?.value as Entity | undefined;
  const delegateAddress = delegate ? entityToAddress(delegate) : undefined;

  const privateKeyIsValid = useMemo(() => {
    // Validate the private key format here
    // This is a basic example, adjust the validation according to your requirements
    return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
  }, [privateKey]);

  const handlePrivateKeyInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputKey = event.target.value;
    setPrivateKey(inputKey);
  };

  const submitPrivateKey = async (privateKey: string) => {
    // Validate the private key format here
    // This is a basic example, adjust the validation according to your requirements
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(privateKey);
    if (!isValid) return;
    const account = privateKeyToAccount(privateKey as Hex);

    if (delegate && delegate === sessionAccount?.entity) return;
    if (delegate) await switchDelegate(mud, account.address);
    else await grantAccess(mud, account.address);

    localStorage.setItem("primodiumSessionKey" + account.address, privateKey);
    setKeyUpdate((prev) => prev + 1); // increment to trigger update
  };

  const handleRandomPress = () => {
    const randomPKey = generatePrivateKey();
    submitPrivateKey(randomPKey);
  };

  const removeSessionKey = (publicKey: string) => {
    localStorage.removeItem("primodiumSessionKey" + publicKey);
    setKeyUpdate((prev) => prev + 1); // increment to trigger update
  };
  const accounts = useMemo(() => findEntriesWithPrefix("primodiumSessionKey"), [keyUpdate]);

  if (delegate && sessionAccount?.entity === delegate)
    return (
      <div className="text-gray-300 flex justify-center items-center font-bold h-full">These accounts are linked</div>
    );
  return (
    <div className="flex flex-col h-full gap-2 text-left">
      Your Account
      <AccountDisplay noName player={playerAccount.entity} className="p-2 bg-gray-700 text-white text-center" />
      Is linked to
      <div className="p-2 bg-gray-700 text-white text-center">
        {delegateAddress ? (
          <>
            <AddressDisplay address={delegateAddress} />
          </>
        ) : (
          "unlinked"
        )}
      </div>
      Session accounts stored locally
      {accounts.length == 0 ? (
        <div className="p-2 bg-gray-700 text-white text-center">NONE!</div>
      ) : (
        accounts.map((account) => (
          <div key={`account-${account.publicKey}`} className="p-2 bg-gray-700 text-white text-center">
            {account.publicKey}
            <FaTrash onClick={() => removeSessionKey(account.publicKey)} />
            <FaAmbulance onClick={() => submitPrivateKey(account.privateKey)} />
          </div>
        ))
      )}
      <Button className="btn-primary" onClick={handleRandomPress}>
        Press me to connect a random session key
      </Button>
      <div className="p-2">
        <input
          type="text"
          value={privateKey}
          onChange={handlePrivateKeyInput}
          placeholder="Enter your private key"
          className="w-full p-2 bg-gray-700 text-white"
        />
      </div>
      <Button className="btn-primary" disabled={!privateKeyIsValid} onClick={() => submitPrivateKey(privateKey)}>
        Connect to input private key
      </Button>
    </div>
  );
}
