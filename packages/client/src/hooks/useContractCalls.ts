import { createContractCalls } from "@/contractCalls/createContractCalls";
import { useDripAccount } from "@/hooks/useDripAccount";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { useMemo } from "react";

export const useContractCalls = () => {
  const core = useCore();
  const accountClient = useAccountClient();
  const { requestDrip } = useDripAccount();

  return useMemo(() => {
    return createContractCalls(core, accountClient, requestDrip);
  }, [core, accountClient, requestDrip]);
};
